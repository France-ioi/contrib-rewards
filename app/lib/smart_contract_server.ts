"use server";

import {TezosToolkit} from '@taquito/taquito';
import config from "@/app/lib/config";
import {UserClient} from "@/app/lib/definitions";
import {operationsGetTransactionByHash} from "@tzkt/sdk-api";
import * as api from "@tzkt/sdk-api";

const Tezos = new TezosToolkit(config.tezosRpc);
api.defaults.baseUrl = 'https://api.ghostnet.tzkt.io';

export async function smartContractAuth(user: UserClient, userAddress: string) {
  const contract = await Tezos.contract.at(config.smartContractAddress);
  //
  // const message = {
  //   emailHash: user.emailHash,
  //   userAddress,
  //   date: new Date(),
  //   contractAddress: config.smartContractAddress,
  // };
  //
  // const signer = new InMemorySigner(config.platformSigningPrivateKey);
  // const signature = await signer.sign(JSON.stringify(message));
  //
  // const authOp = await contract.methodsObject.auth({
  //   message,
  //   signature,
  // }).send();
  //
  // await authOp.confirmation(3);
}

export async function getTransactionLongPolling(hash: string, timeout: number) {
  const interval = 1000; // ms

  for (let iterationsCount = 0; iterationsCount < Math.floor(timeout/interval); iterationsCount++) {
    const transactions = await operationsGetTransactionByHash(hash);
    if (transactions.length > 0) {
      return transactions[0];
    }

    await new Promise(resolve => setTimeout(resolve, interval));
  }

  return null;
}
