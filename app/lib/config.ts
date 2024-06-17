interface Config {
  mysqlDatabase: {
    host: string,
    user: string,
    password: string,
    port: number,
    database: string,
  },
  repositoryEndpoint: string,
  repositoryPath: string,
}

function stringifyIfExists(string: string|undefined): string|undefined {
  return string ? String(string) : undefined;
}

const appConfig: Config = {
  mysqlDatabase: {
    host: String(process.env.MYSQL_DB_HOST),
    user: String(process.env.MYSQL_DB_USER),
    password: String(process.env.MYSQL_DB_PASSWORD),
    port: Number(process.env.MYSQL_DB_PORT),
    database: String(process.env.MYSQL_DB_DATABASE),
  },
  repositoryEndpoint: String(process.env.REPOSITORY_ENDPOINT),
  repositoryPath: String(process.env.REPOSITORY_PATH),
};

export default appConfig;
