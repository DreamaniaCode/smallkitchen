import type {NextConfig} from 'next';
const config:NextConfig={output:'standalone',poweredByHeader:false,serverExternalPackages:['pg','@prisma/adapter-pg','cheerio'],async headers(){return [{source:'/admin/:path*',headers:[{key:'X-Robots-Tag',value:'noindex, nofollow'},{key:'Cache-Control',value:'no-store'}]}];}};
export default config;
