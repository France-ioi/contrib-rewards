import {User} from "@prisma/client";
import bcrypt from "bcrypt";
import config from "@/app/lib/config";

export async function hashEmail(user: User): Promise<string> {
  return await bcrypt.hash(user.email, config.emailHashSalt);
}

export async function generateSalt(saltRounds = 10) {
  return bcrypt.genSaltSync(saltRounds);
}
