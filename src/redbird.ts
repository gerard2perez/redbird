import * as redbird from 'redbird';
import { ModuleManager } from './module_manager';
const proxy = redbird({
    // cluster: 1, 
    //cluster: Math.ceil(os.cpus().length/4),
    port: 80,
    secure: false,
    bunyan: false,
    ssl: {
        port:443
    }
});
export interface Server {
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
export const ServerFile = new ModuleManager<Server>('proxy.yaml');
ServerFile.set = (target:string, server:Server) =>{
    let sources:string[] = [].concat(server.host);
    for(const source of sources) {
        proxy.register(source, target, server.options); 
    }
};
ServerFile.remove = (target:string, server:Server) =>{
    let sources:string[] = [].concat(server.host);
    for(const source of sources) {
        proxy.unregister(source, target);
    }
};

