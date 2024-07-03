import {User} from "@prisma/client";
import bcrypt from "bcrypt";
import config from "@/app/lib/config";

// Use this to generate a salt:
// let saltRounds = 10;
// let salt = bcrypt.genSaltSync(saltRounds);

export async function hashEmail(user: User): Promise<string> {
  return await bcrypt.hash(user.email, config.emailHashSalt);
}
