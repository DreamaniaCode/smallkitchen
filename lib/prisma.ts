import {PrismaClient} from '../generated/prisma/client';
import {PrismaPg} from '@prisma/adapter-pg';
const globalDb=globalThis as unknown as {kitchenPrisma?:PrismaClient};
export function database(){
 if(!process.env.DATABASE_URL)throw new Error('PostgreSQL is not configured.');
 if(!globalDb.kitchenPrisma)globalDb.kitchenPrisma=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL,max:8,connectionTimeoutMillis:10000,idleTimeoutMillis:30000})});
 return globalDb.kitchenPrisma;
}
