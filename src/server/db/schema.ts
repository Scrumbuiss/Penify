import { type InferSelectModel, relations, sql } from "drizzle-orm";
import {
  index,
  primaryKey,
  text,
  timestamp,
  varchar,
  boolean,
  pgTableCreator,
  pgEnum,
  integer,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `${name}`);

export const roleEnum = pgEnum("role", ["ADMIN", "AUTHOR"]);

export const users = createTable("user", {
  id: varchar("id", { length: 191 }).notNull().primaryKey(),
  name: varchar("name", { length: 191 }),
  password: varchar("password", { length: 191 }),
  email: varchar("email", { length: 191 }).notNull().default(""),
  emailVerified: timestamp("email_verified", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
  image: varchar("image", { length: 191 }),
  about: text("about"),
  keywords: varchar("keywords", { length: 191 }),
  role: roleEnum("role").default("AUTHOR").notNull(),

  isBanned: boolean("isBanned").notNull().default(false).notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  Article: many(articles),
  comments: many(comments),
}));

export const accounts = createTable(
  "account",
  {
    id: varchar("id", { length: 191 }),
    userId: varchar("userId", { length: 191 }).notNull(),
    type: varchar("type", { length: 191 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 191 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 191 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 191 }),
    scope: varchar("scope", { length: 191 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 191 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("accounts_userId_idx").on(account.userId),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  {
    sessionToken: varchar("sessionToken", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("userId", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (session) => ({
    userIdIdx: index("session_userId_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verificationToken",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

export const languagesValues = ["PL", "EN", "DE"] as const;

export const languagesValuesExtended = [
  "PL",
  "EN",
  "DE",
  "SA",
  "BG",
  "CN",
  "CZ",
  "EE",
  "FI",
  "FR",
  "GR",
  "HU",
  "ID",
  "IT",
  "JP",
  "KR",
  "LV",
  "NO",
  "PT",
  "BR",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
  "TR",
  "UA",
] as const;

type ObjectValues<T> = T[keyof T];

export type LanguagesValuesExtended = ObjectValues<
  typeof languagesValuesExtended
>;

export const languagesEnum = pgEnum("language", ["PL", "EN", "DE"]);

export const articles = createTable(
  "Article",
  {
    id: varchar("id", { length: 191 }).notNull().primaryKey(),
    title: varchar("title", { length: 191 }).notNull().unique(),
    content: text("content").notNull(),
    description: varchar("description", { length: 255 }).notNull(),
    image: text("image").notNull(),
    category: varchar("category", { length: 191 }).notNull(),
    readingTime: varchar("readingTime", { length: 191 }).notNull(),
    createdAt: timestamp("createdAt", { mode: "date", withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt", {
      mode: "date",
      withTimezone: true,
    }).default(sql`CURRENT_TIMESTAMP`),
    isAccepted: boolean("isAccepted").notNull().default(false),
    isRejected: boolean("isRejected").notNull().default(false),
    isFeatured: boolean("isFeatured").notNull().default(false),
    feedback: varchar("feedback", { length: 191 }).default(""),

    languageExtended: text("languageExtended", {
      enum: languagesValuesExtended,
    })
      .notNull()
      .default("EN"),

    createdById: varchar("createdById", { length: 191 }).notNull(),
    translatedOriginalId: varchar("translatedOriginalId", {
      length: 191,
    }).default(""),
  },
  (article) => ({
    createdByIdIdx: index("article_createdById_idx").on(article.createdById),
  }),
);

export const articlesRelations = relations(articles, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [articles.createdById],
    references: [users.id],
  }),
  comments: many(comments),
  ArticleTags: many(articleTags),
}));

export const comments = createTable(
  "Comment",
  {
    id: varchar("id", { length: 191 }).notNull().primaryKey(),
    content: text("content").notNull(),
    createdAt: timestamp("createdAt", { mode: "date", withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date", withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    createdById: varchar("createdById", { length: 191 }).notNull(),
    articleId: varchar("articleId", { length: 191 }).notNull(),
    isHidden: boolean("isHidden").notNull().default(false),

    commentId: varchar("commentId", { length: 191 }).default(""),
  },
  (comment) => ({
    createdByIdIdx: index("comment_createdById_idx").on(comment.createdById),
    articleIdIdx: index("comment_articleId_idx").on(comment.articleId),
    commentIdIdx: index("comment_commentId_idx").on(comment.commentId),
  }),
);

export const commentsRelations = relations(comments, ({ one, many }) => ({
  article: one(articles, {
    fields: [comments.articleId],
    references: [articles.id],
  }),
  replies: many(comments, { relationName: "CommentToComment" }),
  comment: one(comments, {
    fields: [comments.commentId],
    references: [comments.id],
    relationName: "CommentToComment",
  }),
  createdBy: one(users, {
    fields: [comments.createdById],
    references: [users.id],
  }),
}));

export const articleTags = createTable(
  "ArticleTags",
  {
    id: varchar("id", { length: 191 }).notNull(),
    articleId: varchar("articleId", { length: 191 }).notNull(),
    tag: varchar("tag", { length: 191 }).notNull(),
  },
  (at) => ({
    compoundKey: primaryKey({ columns: [at.articleId, at.tag] }),
  }),
);

export const articleTagsRelations = relations(articleTags, ({ one }) => ({
  article: one(articles, {
    fields: [articleTags.articleId],
    references: [articles.id],
  }),
}));

export const contacts = createTable(
  "Contact",
  {
    id: varchar("id", { length: 191 }).notNull().primaryKey(),
    name: varchar("name", { length: 191 }).notNull(),
    email: varchar("email", { length: 191 }).notNull(),
    theme: varchar("theme", { length: 191 }).notNull(),
    message: text("message").notNull(),
    createdAt: timestamp("createdAt", { mode: "date", withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (contact) => ({
    emailIdx: index("contact_email_idx").on(contact.email),
  }),
);

// types

export type commentsType = InferSelectModel<typeof comments>;
export type languagesType = keyof typeof languagesEnum;
export type articlesTagsType = InferSelectModel<typeof articleTags>;
