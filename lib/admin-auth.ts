import {cookies} from 'next/headers';
import {randomBytes} from 'node:crypto';
import {database} from './prisma';
import {tokenHash} from './password.mjs';
export const sessionCookie='kitchen_owner_session';
export function allowedOwner(email:string|undefined){return !!email&&(process.env.OWNER_EMAILS??'').split(',').map(e=>e.trim().toLowerCase()).filter(Boolean).includes(email.toLowerCase());}
export async function owner(){const token=(await cookies()).get(sessionCookie)?.value;if(!token||!/^[a-f0-9]{64}$/.test(token))return null;const session=await database().ownerSession.findUnique({where:{tokenHash:tokenHash(token)},include:{user:true}});if(!session||session.expiresAt<new Date()||!allowedOwner(session.user.email))return null;return {userId:session.user.id,email:session.user.email,displayName:session.user.email};}
export function sameOrigin(request:Request){return !!process.env.APP_URL&&request.headers.get('origin')===new URL(process.env.APP_URL).origin;}
export async function startSession(userId:string){const token=randomBytes(32).toString('hex');const expiresAt=new Date(Date.now()+7*86400000);await database().ownerSession.create({data:{tokenHash:tokenHash(token),userId,expiresAt}});(await cookies()).set(sessionCookie,token,{httpOnly:true,secure:process.env.APP_URL?.startsWith('https://')??true,sameSite:'lax',path:'/',expires:expiresAt});}
export async function endSession(){const jar=await cookies(),token=jar.get(sessionCookie)?.value;if(token)await database().ownerSession.deleteMany({where:{tokenHash:tokenHash(token)}});jar.delete(sessionCookie);}
export async function claimAuthAttempt(email:string){return database().$transaction(async tx=>{await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${'auth:'+email}))::text`;const since=new Date(Date.now()-15*60000);const row=await tx.authAttempt.findUnique({where:{email}});if(row&&row.windowStart>since&&row.count>=10)return false;await tx.authAttempt.upsert({where:{email},create:{email,windowStart:new Date(),count:1},update:row&&row.windowStart>since?{count:{increment:1}}:{windowStart:new Date(),count:1}});return true;});}
