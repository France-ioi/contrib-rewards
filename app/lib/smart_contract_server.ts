import {TezosToolkit} from '@taquito/taquito';
import config from "@/app/lib/config";
import {User} from "@prisma/client";
import {hashEmail} from "@/app/lib/user";
import {UserClient} from "@/app/lib/definitions";
import {InMemorySigner} from "@taquito/signer";

const Tezos = new TezosToolkit(config.tezosRpc);

export async function getTotalUnclaimedAmount(user: User) {
  try {
    const contract = await Tezos.contract.at(config.smartContractAddress);
    const emailHash = await hashEmail(user);

    return await contract.views.getEmailHashAmount(emailHash).read();
  } catch (e) {
    console.error(e);
    return 42;
  }
}

export async function smartContractAuth(user: UserClient, userAddress: string) {
  const contract = await Tezos.contract.at(config.smartContractAddress);

  const message = {
    emailHash: user.emailHash,
    userAddress,
    date: new Date(),
    contractAddress: config.smartContractAddress,
  };

  const signer = new InMemorySigner(config.platformSigningPrivateKey);
  const signature = await signer.sign(JSON.stringify(message));

  const authOp = await contract.methodsObject.auth({
    message,
    signature,
  }).send();

  await authOp.confirmation(3);
}
