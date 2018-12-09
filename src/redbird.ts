import * as redbird from 'redbird';
import { ModuleManager } from './module_manager';
import * as os from 'os';
const proxy = redbird({
    // cluster: 1, 
    //cluster: Math.ceil(os.cpus().length/4),
    port: 80,
    secure: false,
    // bunyan: false,
    ssl: {
        port:443
    }
});
interface Server {
    host:string | string[]
    options:{
        ssl:{
            redirectPort:number
            key:string
            cert:string,
            ca:string
        }
    }
}
const Servers = new ModuleManager<Server>('proxy.yaml');
Servers.set = (target:string, server:Server) =>{
    let sources:string[] = [].concat(server.host);
    for(const source of sources) {
        // console.log(source, target, server.options);
        proxy.register(source, target, server.options); 
    }
};
Servers.remove = (target:string, server:Server) =>{
    let sources:string[] = [].concat(server.host);
    for(const source of sources) {
        proxy.unregister(source, target);
    }
};