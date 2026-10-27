import {allowedOwner,sameOrigin,claimAuthAttempt} from '../../../../lib/admin-auth';
import {database} from '../../../../lib/prisma';
import {hashPassword,tokenHash} from '../../../../lib/password.mjs';
export async function POST(request:Request){
 if(!sameOrigin(request))return Response.json({error:'Use the recovery page on your website.'},{status:403});
 const raw=await request.text();if(raw.length>4096)return Response.json({error:'Invalid request.'},{status:400});
 let input;try{input=JSON.parse(raw);}catch{return Response.json({error:'Invalid request.'},{status:400});}
 if(!await claimAuthAttempt('password-recovery'))return Response.json({error:'Too many attempts. Try again in 15 minutes.'},{status:429});
 if(typeof input.email!=='string'||!allowedOwner(input.email)||typeof input.token!=='string'||!/^[a-f0-9]{64}$/.test(input.token))return Response.json({error:'Invalid or expired recovery code.'},{status:400});
 try{
  const passwordHash=await hashPassword(input.password),email=input.email.trim().toLowerCase(),digest=tokenHash(input.token);
  await database().$transaction(async tx=>{
   const rows=await tx.$queryRaw<{user_id:string}[]>`DELETE FROM owner_password_resets WHERE token_hash=${digest} AND expires_at>now() AND user_id IN (SELECT id FROM owner_users WHERE email=${email}) RETURNING user_id`;
   if(rows.length!==1)throw Error('Invalid or expired recovery code.');
   const userId=rows[0].user_id;
   await tx.ownerUser.update({where:{id:userId},data:{passwordHash}});
   await tx.ownerSession.deleteMany({where:{userId}});
   await tx.$executeRaw`DELETE FROM owner_password_resets WHERE user_id=${userId}`;
  });
  return Response.json({ok:true},{headers:{'Cache-Control':'no-store'}});
 }catch(e){const message=(e as Error).message;return Response.json({error:message==='Invalid or expired recovery code.'||message.startsWith('Use a password')?message:'Could not reset the password.'},{status:400});}
}
