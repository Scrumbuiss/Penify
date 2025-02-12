import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { users } from "@/server/db/schema";
import { z } from "zod";
import { v4 as uuid } from "uuid";

export const userRouter = createTRPCRouter({
  get: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    return ctx.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, input),
    });
  }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, ctx.session.user.id),
    });

    if (user?.role !== "ADMIN") {
      throw new Error("You are not allowed to do this");
    }

    return ctx.db.query.users.findMany();
  }),
  create: publicProcedure
    .input(
      z.object({
        email: z.string(),
        password: z.string(),
        name: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.insert(users).values({
        id: uuid(),
        email: input.email,
        password: input.password,
        name: input.name,
        role: "AUTHOR",
      });
    }),
});
