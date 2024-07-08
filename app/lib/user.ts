import {User} from "@prisma/client";
import bcrypt from "bcrypt";
import prisma from "@/app/lib/db";

export async function hashEmail(user: User): Promise<string> {
  let userSalt = user.salt;
  if (!userSalt) {
    userSalt = await generateSalt();
    await prisma.user.update({
      data: {
        salt: userSalt,
      },
      where: {
        id: user.id,
      },
    });
  }

  return await bcrypt.hash(user.email, userSalt);
}

export async function generateSalt(saltRounds = 10) {
  return bcrypt.genSaltSync(saltRounds);
}
