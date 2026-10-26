import {database} from './prisma';
export {database} from './prisma';
export const kinds=['articles','keywords','links','tasks','contacts'] as const;
export type Kind=typeof kinds[number];
export type RecordData={id:string;revision?:number;[key:string]:any};
export async function collection(kind:Kind):Promise<RecordData[]>{
 const rows=await database().contentRecord.findMany({where:{kind},orderBy:{id:'asc'}});
 return rows.map(r=>({...r.data as Record<string,unknown>,id:r.id,revision:r.revision,updatedAt:r.updatedAt.toISOString()}));
}
export async function allData(){const result=await Promise.all(kinds.map(k=>collection(k)));return Object.fromEntries(kinds.map((k,i)=>[k,result[i]]));}
export async function recentActivity(){return (await database().auditEntry.findMany({orderBy:{createdAt:'desc'},take:20})).map(r=>({kind:r.kind,record_id:r.recordId,action:r.action,created_at:r.createdAt.toISOString()}));}
