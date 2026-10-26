import {scrypt as derive,randomBytes,timingSafeEqual,createHash} from 'node:crypto';
import {promisify} from 'node:util';
const scrypt=promisify(derive);
export async function hashPassword(password){if(typeof password!=='string'||password.length<12||password.length>256)throw Error('Use a password with 12–256 characters.');const salt=randomBytes(16).toString('hex');const key=await scrypt(password,salt,64,{N:32768,r:8,p:1,maxmem:64*1024*1024});return 'scrypt$'+salt+'$'+key.toString('hex');}
export async function verifyPassword(password,encoded){try{const [type,salt,hex]=encoded.split('$');if(type!=='scrypt'||!/^[a-f0-9]{32}$/.test(salt)||!/^[a-f0-9]{128}$/.test(hex)||typeof password!=='string'||password.length>256)return false;const key=await scrypt(password,salt,64,{N:32768,r:8,p:1,maxmem:64*1024*1024});return timingSafeEqual(key,Buffer.from(hex,'hex'));}catch{return false;}}
export function tokenHash(token){return createHash('sha256').update(token).digest('hex');}
export function safeTokenMatch(a,b){return typeof a==='string'&&typeof b==='string'&&a.length>=32&&timingSafeEqual(Buffer.from(tokenHash(a)),Buffer.from(tokenHash(b)));}
