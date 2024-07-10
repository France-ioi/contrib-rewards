import util from "util";
import {exec as exec0} from "child_process";
const exec = util.promisify(exec0);
import { InMemorySigner } from '@taquito/signer';
import { b58cencode, Prefix, prefix } from '@taquito/utils';
import nodeCrypto from 'crypto';

async function generateSecrets() {
  const nextAuthSecret = (await exec('openssl rand -base64 32')).stdout.trim();
  const signingKey = await generateTaquitoSigningKey();
  console.log(`NEXTAUTH_SECRET='${nextAuthSecret}'
PLATFORM_SIGNING_SECRET_KEY=${signingKey.secretKey}
PLATFORM_SIGNING_PUBLIC_KEY=${signingKey.publicKey}`);
}

(async () => {
  await generateSecrets();
})();

function genSecretKey() {
  const keyBytes = Buffer.alloc(32);
  nodeCrypto.randomFillSync(keyBytes);
  return b58cencode(new Uint8Array(keyBytes), prefix[Prefix.EDSK2]);
}

async function generateTaquitoSigningKey() {
  let secretKey = genSecretKey();
  let signer = new InMemorySigner(secretKey);

  return {
    publicKeyHash: await signer.publicKeyHash(),
    publicKey: await signer.publicKey(),
    secretKey: secretKey,
  };
}
