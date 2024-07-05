import {generateSalt} from "@/app/lib/user";
import util from "util";
import {exec as exec0} from "child_process";
const exec = util.promisify(exec0);

async function generateSecrets() {
  const salt = await generateSalt();
  const nextAuthSecret = (await exec('openssl rand -base64 32')).stdout.trim();
  console.log(`NEXTAUTH_SECRET='${nextAuthSecret}'
EMAIL_HASH_SALT='${salt.replace(/\$/g, "\\$")}'`);
}

(async () => {
  await generateSecrets();
})();
