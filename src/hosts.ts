import { writeFileSync, readFileSync } from "fs";
import { ModuleManager } from "./module_manager";

function host_location () {
	const os = require('os');
	let hostsdlocation = '';
    switch (os.platform()) {
        case 'darwin':
            hostsdlocation = '/private/etc/hosts';
            break;
        case 'linux':
            hostsdlocation = '/etc/hosts';
            break;
        case 'win32':
            hostsdlocation = 'C:\\Windows\\System32\\drivers\\etc\\hosts';
            break;
        default:
            console.error("your os is not detected, hosts files won't be updated");
            break;
	}
	return hostsdlocation;
}

let hosts:Map<string, string> = new Map();
let host_file:[string, string][] = readFileSync(host_location(), 'utf-8')
    .replace(/[\r\n]/g, '\n')
    .split('\n')
    .filter(f=>f)
    .map(line=>line.trim()
        .replace(/ /g, '\t')
        .replace(/\t+/g, '\t').split('\t'))
    .map(line=>[line[1], line[0]]) as [string, string][];
host_file.forEach( ([domain, host]) =>{
    if(!hosts.has(domain)) {
        hosts.set(domain, host);
    }
});
function build () {
    let file = new Map<string, string>();
    hosts.forEach((host:string, domain:string) => {
        file.set(domain, host);
    });
    for(const [key, host] of Hosts.values.entries() ) {
        if(!file.has(key)) {
            file.set(key, host);
        }
    }
    let array_res = []
    file.forEach((host:string, key:string)=>{
        array_res.push(`${host}\t${key}`);
    });
    return array_res.join('\n');
}
const Hosts = new ModuleManager<string>('hosts.yaml');
Hosts.remove = (key:string) =>{
    if (hosts.has(key))
        hosts.delete(key);
    writeFileSync(host_location(), build());
}
Hosts.set = function (key:string, host:string) {
    writeFileSync(host_location(), build());
}