import { createTRPCRouter } from "@/server/api/trpc";
import { dashboardRouter } from "./routers/dashboard";
import { articlesRouter } from "./routers/articles";
import { userRouter } from "./routers/user";
import { contactRouter } from "./routers/contact";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  dashboard: dashboardRouter,
  articles: articlesRouter,
  user: userRouter,
  contact: contactRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
