import pg from 'pg';
import {randomBytes,createHash} from 'node:crypto';
const email=String(process.argv[2]||'').trim().toLowerCase();
if(!email||!(process.env.OWNER_EMAILS||'').split(',').map(x=>x.trim().toLowerCase()).includes(email))throw Error('Provide an allowed owner email.');
const client=new pg.Client({connectionString:process.env.DATABASE_URL,connectionTimeoutMillis:10000});
await client.connect();
try{
 await client.query('BEGIN');
 const user=await client.query('SELECT id FROM owner_users WHERE email=$1 FOR UPDATE',[email]);
 if(user.rowCount!==1)throw Error('This owner account has not been created. Use first-time setup.');
 const token=randomBytes(32).toString('hex'),digest=createHash('sha256').update(token).digest('hex');
 await client.query('DELETE FROM owner_password_resets WHERE user_id=$1 OR expires_at<now()',[user.rows[0].id]);
 await client.query("INSERT INTO owner_password_resets(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '30 minutes')",[digest,user.rows[0].id]);
 await client.query('COMMIT');
 console.log('Recovery page: '+new URL('/admin/reset/',process.env.APP_URL).href);
 console.log('One-time recovery code (expires in 30 minutes):\n'+token);
 console.log('Enter your new password yourself on the recovery page. Existing sessions are revoked only after you complete the reset.');
}catch(e){await client.query('ROLLBACK');console.error(e.message);process.exitCode=1;}finally{await client.end();}
