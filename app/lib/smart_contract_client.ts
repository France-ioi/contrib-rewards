import {TezosToolkit} from '@taquito/taquito';
import config from "@/app/lib/config";
import {BeaconWallet} from "@taquito/beacon-wallet";
import {SmartContractAuthPayload} from "@/app/lib/definitions";

const Tezos = new TezosToolkit(config.tezosRpc);
const wallet = new BeaconWallet({
  name: config.appName,
  network: {
    type: config.tezosNetworkType,
  },
  enableMetrics: true,
});
Tezos.setWalletProvider(wallet);

export async function smartContractAuth(message: SmartContractAuthPayload, signature: string) {
  await connectWallet();

  const contract = await Tezos.wallet.at(config.smartContractAddress);

  const authParameters = {
    message,
    signature,
  };

  console.log({authParameters});

  const estimateOp = contract.methodsObject.auth(authParameters).toTransferParams();
  console.log('estimate op', estimateOp);
  const {gasLimit, storageLimit, suggestedFeeMutez} = await Tezos.estimate.transfer(estimateOp);
  console.log('send');

  const authOp = await contract.methodsObject.auth(authParameters).send({
    storageLimit,
    gasLimit,
    fee: suggestedFeeMutez,
  });

  console.log('after send');

  await authOp.confirmation(3);

  // const claimOp = await contract.methodsObject.claim().send();
  // await claimOp.confirmation(3);
}

export async function connectWallet(): Promise<string> {
  const activeAccount = await wallet.client.getActiveAccount();
  if (!activeAccount) {
    await wallet!.requestPermissions();
  }

  return await wallet!.getPKH();
}

export async function smartContractDonate(mergeId: string, totalAmount: number, recipients: {[recipientEmailHash: string]: number}) {
  await connectWallet();

  const donateParams = {
    mergeID: mergeId,
    recipients: Object.entries(recipients).map(([recipientEmailHash, amount]) => ({
      amount: amount * 1000000,
      recipientEmailHash,
    }))
  };

  // console.log({donateParams, totalAmount});

  const contract = await Tezos.wallet.at(config.smartContractAddress);

  const estimateOp = contract.methodsObject.donate(donateParams).toTransferParams({
    amount: totalAmount,
  });
  const {gasLimit, storageLimit, suggestedFeeMutez} = await Tezos.estimate.transfer(estimateOp);

  const authOp = await contract.methodsObject.donate(donateParams).send({
    amount: totalAmount,
    storageLimit: storageLimit,
    gasLimit: gasLimit,
    fee: suggestedFeeMutez,
  });

  return authOp.opHash;
}

export async function getTotalUnclaimedAmount(emailHash: string) {
  try {
    const contract = await Tezos.contract.at(config.smartContractAddress);

    const result = await contract.contractViews.getEmailHashAmount(emailHash).executeView({
      viewCaller: config.smartContractAddress,
    });

    return result.amount.toNumber() / 1000000;
  } catch (e: unknown) {
    if ('Assert failure: self.data.amountsToClaim.contains(params)' !== (e as {failWith: {string: string}}).failWith.string) {
      console.error(e);
    }

    return 0;
  }
}
