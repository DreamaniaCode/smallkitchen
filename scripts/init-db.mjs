import pg from 'pg';import fs from 'node:fs/promises';import {randomUUID} from 'node:crypto';
if(!process.env.DATABASE_URL)throw Error('DATABASE_URL is required.');
if(process.env.NODE_ENV==='production'&&(!process.env.APP_URL||!process.env.OWNER_EMAILS))throw Error('APP_URL and OWNER_EMAILS are required.');
const client=new pg.Client({connectionString:process.env.DATABASE_URL,connectionTimeoutMillis:10000});await client.connect();
try{await client.query('BEGIN');await client.query("SELECT pg_advisory_xact_lock(hashtext('smallkitchen-schema-seed'))");
await client.query(await fs.readFile(new URL('../infrastructure/schema.sql',import.meta.url),'utf8'));
const seed=JSON.parse(await fs.readFile(new URL('../data/seed.json',import.meta.url),'utf8'));let inserted=0;
for(const kind of ['articles','keywords','links','tasks','contacts'])for(const record of seed[kind]){const r=await client.query('INSERT INTO records(kind,id,data,revision,updated_at,updated_by,operation_id) VALUES($1,$2,$3,1,$4,$5,$6) ON CONFLICT(kind,id) DO NOTHING',[kind,record.id,record,new Date(),'initial-import',randomUUID()]);inserted+=r.rowCount;}
await client.query('COMMIT');console.log('PostgreSQL ready. New content records: '+inserted+'. Existing records preserved.');
} catch(e){await client.query('ROLLBACK');console.error('Database initialization failed; transaction rolled back.');process.exitCode=1;}finally{await client.end();}
