import {owner} from '../../../lib/admin-auth';
import {redirect} from 'next/navigation';
import Generator from './generator';
export const dynamic='force-dynamic';
export const metadata={title:'Article Generator | Field Guide Studio',robots:{index:false,follow:false}};
export default async function Page(){if(!await owner())redirect('/admin/');return <Generator/>;}
