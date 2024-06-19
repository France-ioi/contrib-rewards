interface Config {
  databaseUrl: string,
  repositoryEndpoint: string,
  repositoryPath: string,
  oauthServerUrl: string,
  oauthClientId: string,
  oauthSecretId: string,
}

const appConfig: Config = {
  databaseUrl: String(process.env.DATABASE_URL),
  repositoryEndpoint: String(process.env.REPOSITORY_ENDPOINT),
  repositoryPath: String(process.env.REPOSITORY_PATH),
  oauthServerUrl: String(process.env.NEXT_PUBLIC_OAUTH_SERVER_URL),
  oauthClientId: String(process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID),
  oauthSecretId: String(process.env.OAUTH_SECRET_ID),
};

export default appConfig;
