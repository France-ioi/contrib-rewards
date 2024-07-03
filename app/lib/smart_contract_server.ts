import {TezosToolkit} from '@taquito/taquito';
import config from "@/app/lib/config";
import {User} from "@prisma/client";
import {hashEmail} from "@/app/lib/user";

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
