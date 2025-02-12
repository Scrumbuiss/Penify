import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  articleTags,
  articles,
  languagesValuesExtended,
  users,
} from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { v4 as uuid } from "uuid";

export const dashboardRouter = createTRPCRouter({
  getUserRole: protectedProcedure.query(({ ctx }) => {
    const userId = ctx.session.user.id;

    return ctx.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, userId),
      columns: {
        role: true,
      },
    });
  }),
  getUserAcceptedArticles: protectedProcedure.query(({ ctx }) => {
    const userId = ctx.session.user.id;

    return ctx.db.query.articles.findMany({
      where: (articles, { and, eq }) =>
        and(
          eq(articles.createdById, userId),
          eq(articles.isAccepted, true),
          eq(articles.translatedOriginalId, ""),
        ),
    });
  }),
  getUserOnReviewArticles: protectedProcedure.query(({ ctx }) => {
    const userId = ctx.session.user.id;

    return ctx.db.query.articles.findMany({
      where: (articles, { and, eq }) =>
        and(eq(articles.createdById, userId), eq(articles.isAccepted, false)),
    });
  }),
  getUserArticlesToReview: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const user = await ctx.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, userId),
      columns: {
        role: true,
      },
    });

    if (user?.role !== "ADMIN") {
      throw new Error("You don't have permission to access this resource");
    }

    return ctx.db.query.articles.findMany({
      where: (articles, { eq }) => eq(articles.isAccepted, false),
      with: {
        createdBy: true,
      },
    });
  }),
  currentUserArticle: protectedProcedure
    .input(
      z.object({
        articleId: z.string().optional(),
        language: z.enum(languagesValuesExtended).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { language, articleId } = input;

      const user = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, ctx.session.user.id),
      });

      if (!user) {
        throw new Error("User not found");
      }

      if (!articleId) return null;

      if (user.role === "ADMIN") {
        if (!input.language) {
          return ctx.db.query.articles.findFirst({
            where: (articles, { eq }) => eq(articles.id, articleId),
            with: {
              ArticleTags: true,
            },
          });
        } else {
          const originalArticle = await ctx.db.query.articles.findFirst({
            where: (articles, { and, eq }) =>
              and(
                eq(articles.id, articleId),
                eq(articles.languageExtended, input.language!),
              ),
            with: {
              ArticleTags: true,
            },
          });

          if (!originalArticle) {
            const translatedArticle = await ctx.db.query.articles.findFirst({
              where: (articles, { and, eq }) =>
                and(
                  eq(articles.translatedOriginalId, articleId),
                  eq(articles.languageExtended, input.language!),
                ),
              with: {
                ArticleTags: true,
              },
            });

            if (!translatedArticle) {
              return null;
            } else {
              return translatedArticle;
            }
          }

          return originalArticle;
        }
      }

      if (!language) {
        return ctx.db.query.articles.findFirst({
          where: (articles, { and, eq }) =>
            and(eq(articles.id, articleId), eq(articles.createdById, user.id)),
          with: {
            ArticleTags: true,
          },
        });
      } else {
        const originalArticle = await ctx.db.query.articles.findFirst({
          where: (articles, { and, eq }) =>
            and(
              eq(articles.id, articleId),
              eq(articles.createdById, user.id),
              eq(articles.languageExtended, input.language!),
            ),
          with: {
            ArticleTags: true,
          },
        });

        if (!originalArticle) {
          return ctx.db.query.articles.findFirst({
            where: (articles, { and, eq }) =>
              and(
                eq(articles.translatedOriginalId, articleId),
                eq(articles.createdById, user.id),
                eq(articles.languageExtended, input.language!),
              ),
            with: {
              ArticleTags: true,
            },
          });
        }

        return originalArticle;
      }
    }),
  currentUserOriginalArticle: protectedProcedure
    .input(z.object({ articleId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const { articleId } = input;

      const user = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, ctx.session.user.id),
      });

      if (!user) {
        throw new Error("User not found");
      }

      if (!articleId) return null;

      if (user.role === "ADMIN") {
        return ctx.db.query.articles.findFirst({
          where: (articles, { eq }) => eq(articles.id, articleId),
          with: {
            ArticleTags: true,
          },
        });
      }
      return ctx.db.query.articles.findFirst({
        where: (articles, { and, eq }) =>
          and(eq(articles.id, articleId), eq(articles.createdById, user.id)),
        with: {
          ArticleTags: true,
        },
      });
    }),
  acceptArticle: protectedProcedure
    .input(
      z.object({
        articleId: z.string(),
        value: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db
        .update(articles)
        .set({
          isAccepted: input.value,
        })
        .where(eq(articles.id, input.articleId));
    }),
  updateCurrentUserArticle: protectedProcedure
    .input(
      z.object({
        articleId: z.string(),
        originalArticleId: z.string(),
        title: z.string(),
        content: z.string(),
        description: z.string(),
        image: z.string(),
        category: z.string(),
        readingTime: z.string(),
        tags: z.array(z.string()).nullable(),
        language: z.enum(languagesValuesExtended).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user) {
        throw new Error("Unauthorized");
      }

      if (!input.language) {
        const article = await ctx.db
          .update(articles)
          .set({
            title: input.title,
            image: input.image,
            category: input.category,
            content: input.content,
            description: input.description,
            readingTime: input.readingTime,
          })
          .where(eq(articles.id, input.articleId));

        const translatedArticles = await ctx.db.query.articles.findMany({
          where: (articles, { eq }) =>
            eq(articles.translatedOriginalId, input.articleId),
        });

        await Promise.all(
          translatedArticles.map(async (translatedArticle) => {
            await ctx.db
              .update(articles)
              .set({
                image: input.image,
                category: input.category,
              })
              .where(eq(articles.id, translatedArticle.id));
          }),
        );

        await ctx.db
          .delete(articleTags)
          .where(eq(articleTags.articleId, input.articleId));

        if (input.tags) {
          const tags = input.tags.map((tag) => ({
            tag: tag,
            articleId: input.articleId,
          }));

          await Promise.all(
            tags.map(async (tag) => {
              await ctx.db.insert(articleTags).values({
                id: uuid(),
                tag: tag.tag,
                articleId: input.articleId,
              });
            }),
          );
        }

        return article;
      }

      const originalArticle = await ctx.db.query.articles.findFirst({
        where: (articles, { eq }) => eq(articles.id, input.originalArticleId),
      });

      if (!originalArticle) {
        throw new Error("Original article not found");
      }

      const article = await ctx.db
        .update(articles)
        .set({
          title: input.title,
          image: originalArticle.image,
          category: input.category,
          content: input.content,
          description: input.description,
          readingTime: input.readingTime,
          languageExtended: input.language,
        })
        .where(eq(articles.id, input.articleId));

      if (input.tags) {
        await ctx.db
          .delete(articleTags)
          .where(eq(articleTags.articleId, input.articleId));

        const tags = input.tags.map((tag) => ({
          tag: tag,
          articleId: input.articleId,
        }));

        await Promise.all(
          tags.map(async (tag) => {
            await ctx.db.insert(articleTags).values({
              id: uuid(),
              tag: tag.tag,
              articleId: input.articleId,
            });
          }),
        );
      }

      if (
        input.category !== originalArticle.category ||
        input.image !== originalArticle.image
      ) {
        await ctx.db
          .update(articles)
          .set({
            category: input.category,
            image: input.image,
          })
          .where(eq(articles.id, originalArticle.id));

        const translatedArticles = await ctx.db.query.articles.findMany({
          where: (articles, { eq }) =>
            eq(articles.translatedOriginalId, originalArticle.id),
        });

        await Promise.all(
          translatedArticles.map(async (translatedArticle) => {
            await ctx.db
              .update(articles)
              .set({
                image: input.image,
                category: input.category,
              })
              .where(eq(articles.id, translatedArticle.id));
          }),
        );
      }

      return article;
    }),
  createTranslatedArticle: protectedProcedure
    .input(
      z.object({
        articleId: z.string(),
        title: z.string(),
        content: z.string(),
        description: z.string(),
        image: z.string(),
        category: z.string(),
        readingTime: z.string(),
        tags: z.array(z.string()).nullable(),
        language: z.enum(languagesValuesExtended),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const originalArticle = await ctx.db.query.articles.findFirst({
        where: (articles, { eq }) => eq(articles.id, input.articleId),
      });

      if (!originalArticle) {
        throw new Error("Original article not found");
      }

      const articleId = uuid();

      const article = await ctx.db.insert(articles).values({
        id: articleId,
        title: input.title,
        image: originalArticle.image,
        category: input.category,
        content: input.content,
        description: input.description,
        createdById: userId,
        readingTime: input.readingTime,
        languageExtended: input.language,
        translatedOriginalId: input.articleId,
        isAccepted: false,
      });

      if (input.tags) {
        const tags = input.tags.map((tag) => ({
          tag: tag,
          articleId: articleId,
        }));

        await Promise.all(
          tags.map(async (tag) => {
            await ctx.db.insert(articleTags).values({
              id: uuid(),
              tag: tag.tag,
              articleId: articleId,
            });
          }),
        );
      }

      return article;
    }),
  createArticle: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        content: z.string(),
        description: z.string(),
        image: z.string(),
        category: z.string(),
        readingTime: z.string(),
        langageExtended: z.enum(languagesValuesExtended),
        tags: z.array(z.string()).nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const articleId = uuid();

      const article = await ctx.db.insert(articles).values({
        id: articleId,
        title: input.title,
        image: input.image,
        category: input.category,
        content: input.content,
        description: input.description,
        createdById: userId,
        languageExtended: input.langageExtended,
        readingTime: input.readingTime,
      });

      if (input.tags) {
        const tags = input.tags.map((tag) => ({
          tag: tag,
          articleId: articleId,
        }));

        await Promise.all(
          tags.map(async (tag) => {
            await ctx.db.insert(articleTags).values({
              id: uuid(),
              tag: tag.tag,
              articleId: articleId,
            });
          }),
        );
      }

      return article;
    }),
  deleteArticle: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, ctx.session.user.id),
      });

      const article = await ctx.db.query.articles.findFirst({
        where: (articles, { eq }) => eq(articles.id, input),
      });

      if (!article) {
        throw new Error("Article not found");
      }

      if (user?.role !== "ADMIN" || article.createdById !== user?.id) {
        throw new Error("You don't have permission to delete this article");
      }

      await ctx.db
        .delete(articles)
        .where(eq(articles.translatedOriginalId, input));

      return ctx.db.delete(articles).where(eq(articles.id, input));
    }),
  getUserContacts: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, ctx.session.user.id),
    });

    if (!user || user.role !== "ADMIN") {
      throw new Error("User not found");
    }

    return ctx.db.query.contacts.findMany();
  }),
  getContact: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, ctx.session.user.id),
      });

      if (!user || user.role !== "ADMIN") {
        throw new Error("User not found");
      }

      return ctx.db.query.contacts.findFirst({
        where: (contacts, { eq }) => eq(contacts.id, input),
      });
    }),
  updateUserOptions: protectedProcedure
    .input(
      z.object({
        image: z.string().optional(),
        name: z.string(),
        about: z.string().optional(),
        keywords: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user) {
        throw new Error("Unauthorized");
      }

      return ctx.db
        .update(users)
        .set({
          image: input.image,
          name: input.name,
          about: input.about ?? null,
          keywords: input.keywords ?? "",
        })
        .where(eq(users.id, ctx.session.user.id));
    }),
});
