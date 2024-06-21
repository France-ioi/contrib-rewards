import NextAuth from "next-auth";
import {PrismaAdapter} from "@auth/prisma-adapter"
import config from "@/app/lib/config";
import prisma from "@/app/lib/db";

declare module "next-auth" {
  interface User {
    login: string,
  }
}

export const {handlers, signIn, signOut, auth} = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,

  adapter: PrismaAdapter(prisma),

  providers: [
    {
      id: "france-ioi",
      name: "France-IOI",
      type: "oauth",
      clientId: config.oauthClientId,
      clientSecret: config.oauthSecretId,
      authorization: {
        url: config.oauthServerUrl + "/oauth/authorize",
        params: {
          scope: 'account',
        },
      },
      token: config.oauthServerUrl + "/oauth/token",
      userinfo: config.oauthServerUrl + "/user_api/account",
      profile(profile) {
        return {
          id: String(profile.id),
          login: profile.login,
          firstName: profile.first_name,
          lastName: profile.last_name,
          email: profile.primary_email,
        };
      },
    }
  ],
});
