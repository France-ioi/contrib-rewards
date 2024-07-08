import NextAuth, {type DefaultSession} from "next-auth";
import {PrismaAdapter} from "@auth/prisma-adapter"
import config from "@/app/lib/config";
import prisma from "@/app/lib/db";
import {User, Prisma} from "@prisma/client";
import {hashEmail} from "@/app/lib/user";
import {UserClient} from "@/app/lib/definitions";

declare module "next-auth" {
  interface Session {
    user: UserClient,
  }
}

const prismaAdapter = PrismaAdapter(prisma);

// @ts-ignore
prismaAdapter.createUser = (data: User) => {
  const dataWithoutEmailVerified = {...data};

  // @ts-ignore
  delete dataWithoutEmailVerified.id;
  // @ts-ignore
  delete dataWithoutEmailVerified.emailVerified;

  return prisma.user.create({
    data: dataWithoutEmailVerified,
  });
};

export const {handlers, signIn, signOut, auth} = NextAuth({
  secret: config.nextAuthSecret,

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
      allowDangerousEmailAccountLinking: true, // The login module is presumed to verify user email address
      token: config.oauthServerUrl + "/oauth/token",
      userinfo: config.oauthServerUrl + "/user_api/account",
      profile(profile) {
        // console.log('profile', profile);
        return {
          id: String(profile.id),
          login: profile.login,
          name: profile.first_name + ' ' + profile.last_name,
          email: 'VERIFIED' === profile.verification?.primary_email ? profile.primary_email : null,
          image: profile.picture,
        };
      },
    }
  ],

  callbacks: {
    async session({session, user}) {
      return {
        ...session,
        user: {
          ...session.user,
          emailHash: await hashEmail(session.user),
        }
      };
    },
  },

  events: {
    async linkAccount({profile, user}) {
      // @ts-ignore
      await completeUserDataWithProfile(profile, user);

      // TODO: enable if necessary and if the login module can check secondary email without it being mandatory
      // @ts-ignore
      // if ('VERIFIED' === profile?.verification?.secondary_email) {
      //   const secondaryEmail = profile.secondary_email;
      //   if (secondaryEmail) {
      //     await checkToMergeAccountWithEmail(secondaryEmail as string, user);
      //   }
      // }
    },
  }
});

async function checkToMergeAccountWithEmail(email: string, user: {id?: string}) {
  const userAccountWithEmail = await prisma.user.findUnique({
    where: {
      email,
    },
    include: {
      Account: true,
    },
  });

  if (null === userAccountWithEmail || userAccountWithEmail.id === user.id || userAccountWithEmail.Account) {
    return;
  }

  // Merge account
  await prisma.mergeRequestAuthor.updateMany({
    data: {
      authorId: user.id,
    },
    where: {
      authorId: userAccountWithEmail.id,
    },
  });
}

async function completeUserDataWithProfile(profile: {login: string, image: string|null}, user: User) {
  const dataToUpdate: Prisma.UserUpdateInput = {};
  if (profile.login && !user.login) {
    dataToUpdate.login = profile.login;
  }
  if (profile.image && !user.image) {
    dataToUpdate.image = profile.image;
  }

  if (Object.keys(dataToUpdate).length) {
    await prisma.user.update({
      data: dataToUpdate,
      where: {
        email: user.email!,
      },
    })
  }
}
