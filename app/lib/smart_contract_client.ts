import {TezosToolkit} from '@taquito/taquito';
import config from "@/app/lib/config";
import {BeaconWallet} from "@taquito/beacon-wallet";
import {RequestSignPayloadInput, SigningType} from "@airgap/beacon-dapp";
import {stringToBytes} from "@taquito/utils";

const Tezos = new TezosToolkit(config.tezosRpc);
const wallet = new BeaconWallet({
  name: config.appName,
  network: {
    type: config.tezosNetworkType,
  },
  // disableDefaultEvents: false,
  enableMetrics: true,
});
Tezos.setWalletProvider(wallet);

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

  return await wallet!.getPKH();
}

export async function signWalletOwnership() {
  const userAddress = await connectWallet();

  const formattedInput: string = [
    'Tezos Signed Message:',
  ].join(' ');

// The bytes to sign
  const bytes = stringToBytes(formattedInput);
  const bytesLength = (bytes.length / 2).toString(16);
  const addPadding = `00000000${bytesLength}`;
  const paddedBytesLength = addPadding.slice(addPadding.length - 8);
  const payloadBytes = '05' + '01' + paddedBytesLength + bytes;

  const payload: RequestSignPayloadInput = {
    signingType: SigningType.MICHELINE,
    payload: payloadBytes,
    sourceAddress: userAddress,
  };

  const signedPayload = await wallet.client.requestSignPayload(payload);

  return signedPayload.signature;
}

export async function smartContractDonate(mergeId: string, totalAmount: number, recipients: {[recipientEmailHash: string]: number}) {
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


    return await contract.contractViews.getEmailHashAmount(emailHash).executeView({
      viewCaller: config.smartContractAddress,
    });
  } catch (e: unknown) {
    if ('Assert failure: self.data.amountsToClaim.contains(params)' !== (e as {failWith: {string: string}}).failWith.string) {
      console.error(e);
    }

    return 0;
  }
}
