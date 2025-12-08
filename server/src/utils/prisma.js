import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import mariadb from 'mariadb';

// create mariadb connection pool from DATABASE_URL
const getDatabaseConfig = () => {
  const url = new URL(process.env.DATABASE_URL);
  return {
    host: url.hostname,
    port: parseInt(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1), // remove leading slash
    connectionLimit: 5,
  };
};

// create adapter and prisma client instance
const pool = mariadb.createPool(getDatabaseConfig());
const adapter = new PrismaMariaDb(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
