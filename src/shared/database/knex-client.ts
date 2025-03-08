import knex from 'knex';
import config from '../../../knexfile';
import 'dotenv/config';

const environment = 'development';

if (!config[environment]) {
  throw new Error(
    `Knex configuration not found for environment: ${environment}`,
  );
}

const db = knex(config[environment]);

export default db;
