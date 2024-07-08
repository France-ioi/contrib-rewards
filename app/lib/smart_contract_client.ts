import {TezosToolkit} from '@taquito/taquito';
import config from "@/app/lib/config";
import {BeaconWallet} from "@taquito/beacon-wallet";

const Tezos = new TezosToolkit(config.tezosRpc);
const wallet = new BeaconWallet({
  name: config.appName,
  network: {
    type: config.tezosNetworkType,
  },
  // disableDefaultEvents: false,
  enableMetrics: true,
});

export async function smartContractClaim(emailHash: string) {
  await connectWallet();

  const contract = await Tezos.contract.at(config.smartContractAddress);
  const authOp = await contract.methodsObject.auth(emailHash).send();
  await authOp.confirmation(3);

  const claimOp = await contract.methodsObject.claim().send();
  await claimOp.confirmation(3);
}

export async function connectWallet(): Promise<string> {
  await wallet!.requestPermissions();
  Tezos.setWalletProvider(wallet);

  return await wallet!.getPKH();
}
