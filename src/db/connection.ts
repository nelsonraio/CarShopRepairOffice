import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

const pool = mysql.createPool({
  uri: process.env.DATABASE_URL ?? 'mysql://root:@localhost:3306/carrepairshopgest',
});

export const db = drizzle(pool, { schema, mode: 'default' });
