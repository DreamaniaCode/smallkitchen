import {owner} from '../../lib/admin-auth';
import Dashboard from './studio';
import Login from './login';
export const dynamic='force-dynamic';
export const metadata={title:'Field Guide Studio',robots:{index:false,follow:false}};
export default async function Admin(){const allowed=await owner();if(allowed)return <><form action="/api/auth/logout" method="post" style={{position:'fixed',right:18,bottom:16,zIndex:50}}><button type="submit">Sign out</button></form><Dashboard name={allowed.displayName}/></>;return <Login/>;}
