import {endSession,sameOrigin} from '../../../../lib/admin-auth';
export async function POST(request:Request){if(!sameOrigin(request))return new Response('Forbidden',{status:403});await endSession();return Response.redirect(new URL('/admin/',process.env.APP_URL!),303);}
