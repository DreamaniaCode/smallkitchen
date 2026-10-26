import {database} from '../../../lib/prisma';
export const dynamic='force-dynamic';
export async function GET(){try{await database().$queryRaw`SELECT 1`;return Response.json({status:'ok',storage:'PostgreSQL'},{headers:{'Cache-Control':'no-store'}});}catch{return Response.json({status:'unavailable'},{status:503});}}
