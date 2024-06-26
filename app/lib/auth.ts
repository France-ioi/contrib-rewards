import NextAuth from "next-auth";
import {PrismaAdapter} from "@auth/prisma-adapter"
import config from "@/app/lib/config";
import prisma from "@/app/lib/db";
import {User} from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: User,
  }
}

const prismaAdapter = PrismaAdapter(prisma);

// @ts-ignore
prismaAdapter.createUser = (data: User) => {
  const dataWithoutEmailVerified = {...data};

  // @ts-ignore
  delete dataWithoutEmailVerified.emailVerified;

  return prisma.user.create({
    data: dataWithoutEmailVerified,
  });
};

export const {handlers, signIn, signOut, auth} = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,

  adapter: prismaAdapter,

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
          name: profile.first_name + ' ' + profile.last_name,
          email: profile.primary_email,
          image: profile.picture,
        };
      },
    }
  ],

  callbacks: {
    session({session, user}) {
      return session;
    },
  }
});
