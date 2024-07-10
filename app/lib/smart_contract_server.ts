"use server";

import config from "@/app/lib/config";
import {SmartContractAuthPayload, UserClient} from "@/app/lib/definitions";
import {operationsGetTransactionByHash} from "@tzkt/sdk-api";
import * as api from "@tzkt/sdk-api";
import {InMemorySigner} from "@taquito/signer";
import {MichelsonData, MichelsonType, packDataBytes} from "@taquito/michel-codec";

api.defaults.baseUrl = 'https://api.ghostnet.tzkt.io';

export async function getSmartContractAuthParameters(user: UserClient): Promise<{message: SmartContractAuthPayload, signature: string}> {
  const message: SmartContractAuthPayload = {
    date: String(Math.floor((new Date()).getTime() / 1000)),
    emailHash: user.emailHash,
    contractAddress: config.smartContractAddress,
  };

  const data: MichelsonData = {
    "prim": "Pair",
    "args": [
      {
        "string": message.contractAddress,
      },
      {
        "int": message.date,
      },
      {
        "string": message.emailHash,
      },
    ]
  };

  const type: MichelsonType = {
    "prim": "pair",
    "args": [
      {
        "prim": "address"
      },
      {
        "prim": "int"
      },
      {
        "prim": "string"
      },
    ]
  };

  const packedBytes = packDataBytes(data, type);

  const signer = new InMemorySigner(config.platformSigningSecretKey);
  const signed = await signer.sign(packedBytes.bytes);
  const signature = signed.prefixSig;

  return {
    message,
    signature,
  }
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
