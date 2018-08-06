import * as redbird from 'redbird';
import { ModuleManager } from './module_manager';
const proxy = redbird({
    port: 80,
    secure: false,
    // bunyan: false,
    ssl: {
        port:443
    }
});
interface Server {
    target:string
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
Servers.set = (key:string, value:Server) =>{
    proxy.register(key, value.target, value.options);
};
Servers.remove = (key:string, value:Server) =>{
    proxy.unregister(key, value.target);
};