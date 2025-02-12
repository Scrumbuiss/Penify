import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { desc, eq } from "drizzle-orm";
import {
  articles,
  comments,
  languagesValuesExtended,
} from "@/server/db/schema";
import { v4 as uuid } from "uuid";

export const articlesRouter = createTRPCRouter({
  getAllArticles: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        locale: z.enum(languagesValuesExtended),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { locale, category } = input;

      const currentLanguageArticles = await ctx.db.query.articles.findMany({
        where: (articles, { eq, and }) => {
          if (category) {
            return and(
              eq(articles.isAccepted, true),
              eq(articles.category, category),
              eq(articles.languageExtended, locale),
            );
          }
          return and(
            eq(articles.isAccepted, true),
            eq(articles.languageExtended, locale),
          );
        },
        with: {
          createdBy: {
            columns: {
              name: true,
              image: true,
            },
          },
        },
      });

      const otherLanguageArticles = await ctx.db.query.articles.findMany({
        where: (articles, { eq, and, ne }) => {
          if (category) {
            return and(
              eq(articles.isAccepted, true),
              eq(articles.category, category),
              ne(articles.languageExtended, locale),
            );
          }
          return and(
            eq(articles.isAccepted, true),
            ne(articles.languageExtended, locale),
          );
        },
        with: {
          createdBy: {
            columns: {
              name: true,
              image: true,
            },
          },
        },
      });

      const originalOtherArticles = otherLanguageArticles.filter(
        (article) => article.translatedOriginalId === "",
      );

      return {
        localeArticles: currentLanguageArticles,
        otherLanguageArticles: originalOtherArticles,
      };
    }),
  getArticle: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.db.query.articles.findFirst({
        where: (articles, { eq, and }) =>
          and(eq(articles.id, input.id), eq(articles.isAccepted, true)),
        with: {
          createdBy: {
            columns: {
              name: true,
              image: true,
              keywords: true,
              about: true,
            },
          },
          ArticleTags: true,
        },
      });
    }),
  getArticleLanguages: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const currentArticle = await ctx.db.query.articles.findFirst({
        where: (articles, { eq }) => eq(articles.id, input.id),
        columns: {
          id: true,
          translatedOriginalId: true,
          languageExtended: true,
        },
      });

      if (!currentArticle) {
        throw new Error("Article not found");
      }

      if (currentArticle?.translatedOriginalId) {
        const translatedArticles = await ctx.db.query.articles.findMany({
          where: (articles, { eq, ne, and }) =>
            and(
              eq(
                articles.translatedOriginalId,
                currentArticle.translatedOriginalId!,
              ),
              ne(articles.id, currentArticle.id),
            ),
          with: {
            createdBy: {
              columns: {
                name: true,
                image: true,
              },
            },
          },
        });

        const originalArticle = await ctx.db.query.articles.findFirst({
          where: (articles, { eq }) =>
            eq(articles.id, currentArticle.translatedOriginalId!),
          columns: {
            id: true,
            isAccepted: true,
            languageExtended: true,
          },
        });

        return [...translatedArticles, originalArticle];
      }

      return ctx.db.query.articles.findMany({
        where: (articles, { eq }) =>
          eq(articles.translatedOriginalId, currentArticle.id),
        columns: {
          id: true,
          isAccepted: true,
          languageExtended: true,
        },
      });
    }),
  getSearchedArticles: publicProcedure
    .input(
      z.object({
        search: z.string(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.db.query.articles.findMany({
        where: (articles, { and, eq, or, like }) =>
          and(
            eq(articles.isAccepted, true),
            or(
              like(articles.title, `%${input.search}%`),
              like(articles.content, `%${input.search}%`),
            ),
          ),
        with: {
          createdBy: {
            columns: {
              name: true,
            },
          },
        },
      });
    }),
  getFeaturedArticle: publicProcedure.query(async ({ ctx }) => {
    const featuredArticle = await ctx.db.query.articles.findFirst({
      where: (articles, { eq, and }) =>
        and(eq(articles.isFeatured, true), eq(articles.isAccepted, true)),
      orderBy: desc(articles.createdAt),
      with: {
        createdBy: {
          columns: {
            name: true,
            image: true,
          },
        },
      },
    });

    if (!featuredArticle) {
      return ctx.db.query.articles.findFirst({
        where: (articles, { eq }) => eq(articles.isAccepted, true),
        orderBy: desc(articles.createdAt),
        with: {
          createdBy: {
            columns: {
              name: true,
              image: true,
            },
          },
        },
      });
    }

    return featuredArticle;
  }),
  getRelatedArticles: publicProcedure
    .input(
      z.object({
        articleId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const category = await ctx.db.query.articles.findFirst({
        where: (articles, { eq }) => eq(articles.id, input.articleId),
        columns: {
          category: true,
        },
      });
      const relatedArticles = await ctx.db.query.articles.findMany({
        limit: 3,
        where: (articles, { and, eq, not }) => {
          if (!category) {
            return and(
              not(eq(articles.id, input.articleId)),
              eq(articles.translatedOriginalId, ""),
              eq(articles.isAccepted, true),
            );
          }

          return and(
            not(eq(articles.id, input.articleId)),
            eq(articles.isAccepted, true),
            eq(articles.translatedOriginalId, ""),
            eq(articles.category, category?.category),
          );
        },
        orderBy: desc(articles.createdAt),
        with: {
          createdBy: {
            columns: {
              name: true,
              image: true,
            },
          },
        },
      });

      if (relatedArticles.length < 3) {
        const remainingArticles = await ctx.db.query.articles.findMany({
          limit: 3 - relatedArticles.length,
          where: (articles, { and, eq, not }) => {
            if (!category) {
              return and(
                not(eq(articles.id, input.articleId)),
                eq(articles.isAccepted, true),
              );
            }

            return and(
              not(eq(articles.id, input.articleId)),
              eq(articles.isAccepted, true),
              not(eq(articles.category, category?.category)),
            );
          },
          orderBy: desc(articles.createdAt),
          with: {
            createdBy: {
              columns: {
                name: true,
                image: true,
              },
            },
          },
        });

        return [...relatedArticles, ...remainingArticles];
      } else {
        return relatedArticles;
      }
    }),
  getArticleComments: publicProcedure
    .input(
      z.object({
        articleId: z.string(),
      }),
    )
    .query(({ ctx, input }) => {
      // depth 6
      return ctx.db.query.comments.findMany({
        where: (comments, { eq, and }) =>
          and(
            eq(comments.articleId, input.articleId),
            eq(comments.isHidden, false),
          ),
        orderBy: desc(comments.createdAt),
        with: {
          createdBy: {
            columns: {
              name: true,
              image: true,
            },
          },
          replies: {
            with: {
              createdBy: {
                columns: {
                  name: true,
                  image: true,
                },
              },
              replies: {
                with: {
                  createdBy: {
                    columns: {
                      name: true,
                      image: true,
                    },
                  },
                  replies: {
                    with: {
                      createdBy: {
                        columns: {
                          name: true,
                          image: true,
                        },
                      },
                      replies: {
                        with: {
                          createdBy: {
                            columns: {
                              name: true,
                              image: true,
                            },
                          },
                          replies: {
                            with: {
                              createdBy: {
                                columns: {
                                  name: true,
                                  image: true,
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });
    }),
  createArticleComment: protectedProcedure
    .input(
      z.object({
        articleId: z.string(),
        content: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, ctx.session?.user.id),
      });

      if (!user) {
        throw new Error("Unauthorized");
      }

      if (user.isBanned) {
        throw new Error("You are banned and cannot comment");
      }

      return ctx.db.insert(comments).values({
        id: uuid(),
        content: input.content,
        articleId: input.articleId,
        createdById: user.id,
      });
    }),
  createReplayComment: protectedProcedure
    .input(
      z.object({
        articleId: z.string(),
        commentId: z.string(),
        content: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, ctx.session?.user.id),
      });

      if (!user) {
        throw new Error("Unauthorized");
      }

      if (user.isBanned) {
        throw new Error("You are banned and cannot comment");
      }

      return ctx.db.insert(comments).values({
        id: uuid(),
        articleId: input.articleId,
        content: input.content,
        commentId: input.commentId,
        createdById: user.id,
      });
    }),
  hideComment: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session?.user;

      if (!user) {
        throw new Error("Unauthorized");
      }

      const comment = await ctx.db.query.comments.findFirst({
        where: (comments, { eq }) => eq(comments.id, input.id),
        columns: {
          createdById: true,
        },
        with: {
          replies: true,
        },
      });

      if (user.role === "ADMIN") {
        return ctx.db
          .update(comments)
          .set({
            isHidden: true,
          })
          .where(eq(comments.id, input.id));
      }

      if (comment?.createdById !== user.id) {
        throw new Error("Unauthorized");
      }

      return ctx.db
        .update(comments)
        .set({
          isHidden: true,
        })
        .where(eq(comments.id, input.id));
    }),
});
