import * as redbird from 'redbird';
import { ModuleManager } from './module_manager';
import * as os from 'os';
const proxy = redbird({
    // cluster: os.cpus().length,
    port: 80,
    secure: false,
    bunyan: false,
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
    console.log(`Add: ${sources.join(',')} => ${target}`);
    for(const source of sources) {
        proxy.register(source, target, server.options); 
    }
};
Servers.remove = (target:string, server:Server) =>{
    let sources:string[] = [].concat(server.host);
    console.log(`Remove: ${sources.join(',')} => ${target}`);
    for(const source of sources) {
        proxy.unregister(source, target);
    }
};