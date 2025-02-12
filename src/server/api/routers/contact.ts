import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { contacts } from "@/server/db/schema";
import { z } from "zod";
import { v4 as uuid } from "uuid";

export const contactRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string(),
        theme: z.string(),
        message: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.insert(contacts).values({
        id: uuid(),
        name: input.name,
        email: input.email,
        theme: input.theme,
        message: input.message,
      });
    }),
});
