import {NetworkType} from "@airgap/beacon-types";

interface Config {
  appName: string,
  databaseUrl: string,
  repositoryEndpoint: string,
  repositoryPath: string,
  oauthServerUrl: string,
  oauthClientId: string,
  oauthSecretId: string,
  donationPeriodMonths: number,
  donationPeriodLabel: string,
  donationTarget: number,
  currency: string,
  webServerUrl: string,
  contributionsDisplayLastCount: number,
  tezosRpc: string,
  tezosNetworkType: NetworkType,
  smartContractAddress: string,
  nextAuthSecret: string,
  nodeEnv: string,
  platformSigningSecretKey: string,
}

const appConfig: Config = {
  appName: String(process.env.NEXT_PUBLIC_APP_NAME),
  databaseUrl: String(process.env.DATABASE_URL),
  repositoryEndpoint: String(process.env.REPOSITORY_ENDPOINT),
  repositoryPath: String(process.env.REPOSITORY_PATH),
  oauthServerUrl: String(process.env.NEXT_PUBLIC_OAUTH_SERVER_URL),
  oauthClientId: String(process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID),
  oauthSecretId: String(process.env.OAUTH_SECRET_ID),
  donationPeriodMonths: Number(process.env.DONATION_PERIOD_MONTHS),
  donationPeriodLabel: String(process.env.DONATION_PERIOD_LABEL),
  donationTarget: Number(process.env.NEXT_PUBLIC_DONATION_TARGET),
  currency: String(process.env.NEXT_PUBLIC_CURRENCY),
  webServerUrl: String(process.env.NEXT_PUBLIC_WEB_SERVER_URL),
  contributionsDisplayLastCount: Number(process.env.CONTRIBUTIONS_DISPLAY_LAST_COUNT),
  tezosRpc: String(process.env.NEXT_PUBLIC_TEZOS_RPC),
  tezosNetworkType: String(process.env.NEXT_PUBLIC_TEZOS_NETWORK_TYPE) as NetworkType,
  smartContractAddress: String(process.env.NEXT_PUBLIC_TEZOS_SMART_CONTRACT_ADDRESS),
  nextAuthSecret: String(process.env.NEXTAUTH_SECRET),
  nodeEnv: String(process.env.NODE_ENV),
  platformSigningSecretKey: String(process.env.PLATFORM_SIGNING_SECRET_KEY),
};

export default appConfig;
