import {database} from '../../../lib/prisma';import Setup from './setup';import {redirect} from 'next/navigation';
export const dynamic='force-dynamic';export const metadata={title:'Owner setup',robots:{index:false,follow:false}};
export default async function Page(){if(await database().ownerUser.count())redirect('/admin/');return <Setup/>;}
