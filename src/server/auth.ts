import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { type DefaultSession } from "next-auth";
import { type Adapter } from "next-auth/adapters";

// import DiscordProvider from "next-auth/providers/discord";
// import GoogleProvider from "next-auth/providers/google";
// import FacebookProvider from "next-auth/providers/facebook";
import CredentialProvider from "next-auth/providers/credentials";

import { env } from "@/env";
import { db } from "@/server/db";
import { verifyPassword } from "@/utils";
import NextAuth from "next-auth";
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from "@/server/db/schema";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      role: "ADMIN" | "AUTHOR";
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

export const {
  handlers: { GET, POST },
  auth,
} = NextAuth({
  callbacks: {
    session: ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string;
      }

      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
        },
      };
    },
    jwt: ({ token, user }) => {
      const data = token;
      if (user) {
        data.id = user.id;
      }
      return data;
    },
  },
  secret: env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }) as Adapter,
  providers: [
    // Providers only if your app is public for other users
    // DiscordProvider({
    //   clientId: env.DISCORD_CLIENT_ID,
    //   clientSecret: env.DISCORD_CLIENT_SECRET,
    // }),
    // GoogleProvider({
    //   clientId: env.GOOGLE_CLIENT_ID,
    //   clientSecret: env.GOOGLE_CLIENT_SECRET,
    // }),
    // FacebookProvider({
    //   clientId: env.FACEBOOK_CLIENT_ID,
    //   clientSecret: env.FACEBOOK_CLIENT_SECRET,
    // }),
    CredentialProvider({
      name: "credentials",
      credentials: {
        email: {
          label: "E-Mail",
          type: "email",
        },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const user = await db.query.users.findFirst({
          where: (users, { eq }) =>
            eq(users.email, credentials?.email as string),
        });

        if (!user) {
          throw new Error("invalidEmailOrPassword");
        }

        const isValid = await verifyPassword(
          (credentials?.password as string) ?? "",
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          user.password!,
        );

        if (!isValid) {
          throw new Error("errorOccurred");
        }

        return user;
      },
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  // loggers for debugging auth
  // logger: {
  //   error(code, ...message) {
  //     console.log(code, message)
  //   },
  //   warn(code, ...message) {
  //     console.log(code, message)
  //   },
  //   debug(code, ...message) {
  //     console.log(code, message)
  //   }
  // }
});

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
// export const getServerAuthSession = () => auth();
