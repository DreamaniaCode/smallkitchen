import {owner,sameOrigin} from '../../../lib/admin-auth';
import {allData,collection,database,kinds,recentActivity,type Kind} from '../../../lib/content';
import {validate} from '../../../lib/validation.mjs';
import {Prisma} from '../../../generated/prisma/client';
export const dynamic='force-dynamic';
function json(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store'}});}
export async function GET(){if(!await owner())return json({error:'Owner access required.'},403);try{return json({data:await allData(),activity:await recentActivity()});}catch{return json({error:'Storage is unavailable. Please try again; no data was changed.'},503);}}
export async function POST(request:Request){const user=await owner();if(!user)return json({error:'Owner access required.'},403);if(!sameOrigin(request))return json({error:'This change must come from your own dashboard.'},403);if(!request.headers.get('content-type')?.includes('application/json'))return json({error:'JSON required.'},415);
 const bytes=await request.text();if(new TextEncoder().encode(bytes).length>100000)return json({error:'Record is too large.'},413);let input;try{input=JSON.parse(bytes)}catch{return json({error:'Invalid JSON.'},400)}
 if(!kinds.includes(input.kind)||typeof input.id!=='string'||!/^[a-zA-Z0-9-]{1,120}$/.test(input.id)||!Number.isSafeInteger(input.revision)||input.revision<0)return json({error:'Invalid collection, record ID or revision.'},400);
 let record;try{record=validate(input.kind,input.record)}catch(e){return json({error:(e as Error).message},400)}
 try{const kind=input.kind as Kind;if(kind==='articles'){const records=await collection('articles');if(records.some(a=>a.id!==input.id&&a.slug===record.slug))return json({error:'Another article already uses this URL slug.'},409);const previous=records.find(a=>a.id===input.id);record.createdAt=previous?.createdAt||new Date().toISOString();record.publishedAt=previous?.publishedAt||(record.status==='published'?new Date().toISOString():'');}
 const now=new Date(),operation=crypto.randomUUID(),revision=input.revision+1,data={...record,id:input.id} as Prisma.InputJsonValue;
 await database().$transaction(async tx=>{if(input.revision===0){await tx.contentRecord.create({data:{kind,id:input.id,data,revision,updatedAt:now,updatedBy:user.userId,operationId:operation}});}else{const result=await tx.contentRecord.updateMany({where:{kind,id:input.id,revision:input.revision},data:{data,revision,updatedAt:now,updatedBy:user.userId,operationId:operation}});if(!result.count)throw Error('conflict');}await tx.auditEntry.create({data:{id:operation,kind,recordId:input.id,action:record.status.toLowerCase()==='archived'?'archived':'saved',actor:user.userId,createdAt:now}});});
 return json({record:{...record,id:input.id,revision,updatedAt:now.toISOString()}});
 }catch(e){if((e as Error).message==='conflict'||e instanceof Prisma.PrismaClientKnownRequestError&&['P2002','P2034'].includes(e.code))return json({error:'This record changed or its URL is already used. Reload before saving again.'},409);return json({error:'Could not save the record. Your edits remain in the editor; please retry.'},503);}
}
