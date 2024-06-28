interface Config {
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
}

const appConfig: Config = {
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
};

export default appConfig;
