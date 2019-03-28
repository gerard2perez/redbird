import { createServer, IncomingMessage, ServerResponse } from 'http';
import { Server, ServerFile } from './redbird';
import { HostsFile } from './hosts';
enum Operation {
    add = 'POST',
    update = 'UPDATE',
    remove = 'DELETE'
}
async function rawbody(stream: IncomingMessage) {
    return new Promise((resolve, reject)=> {
        let body = [];
        stream.on('data', (chunck)=>{
            body.push(chunck);
        }).on('end', ()=>{
            resolve(Buffer.concat(body));
        });
    }) as Promise<Buffer>;
}
const managers = {
    proxy: {
        async DELETE(body:any):Promise<[any, number]> {
            let configuration = ServerFile.json();
            let source = configuration[body.source];
            let status = 204;
            if(source) {
                ServerFile.delete(body.source, source);
            }
            return [{}, status];
        },
        async GET(body:any):Promise<[any, number]> {
            return [ServerFile.json(), 200];
        },
        async POST(body:any):Promise<[any, number]> {
            let response:any = {};
            let status;
            let configuration = ServerFile.json();
            let source = configuration[body.source];
            if(source) {
                response.error = 'This Source Already exists';
                status = 500;
            } else {
                let entry:any = {host:body.target};
                if(Object.keys(body.options).length)entry.options = body.options;
                ServerFile.add(body.source, entry);
                status = 201;
            }
            return [response, status];
        },
        async PUT(body:any):Promise<[any, number]> {
            let response:any = {};
            let status;
            let configuration = ServerFile.json();
            let source = configuration[body.source];
            if(!source) {
                response.error = 'This Source does not exists';
                status = 500;
            } else {
                ServerFile.delete(body.source, source);
                let entry:any = {host:body.target};
                if(Object.keys(body.options).length)entry.options = body.options;
                ServerFile.add(body.source, entry);
                status = 200;
            }
            return [response, status];
        }
    },
    hosts: {
        async DELETE(body:any):Promise<[any, number]> {
            let configuration = HostsFile.json();
            let source = configuration[body.target];
            let status = 204;
            if(source) {
                HostsFile.delete(body.target, source);
            }
            return [{}, status];
        },
        async GET(body:any):Promise<[any, number]> {
            return [HostsFile.json(), 200];
        },
        async POST(body:any):Promise<[any, number]> {
            let response:any = {};
            let status;
            let configuration = HostsFile.json();
            let source = configuration[body.target];
            if(source) {
                response.error = 'This Target Already exists';
                status = 500;
            } else {
                // let entry:any = {[body.target]: body.source};
                // let entry:any = {host:body.target};
                // if(Object.keys(body.options).length)entry.options = body.options;
                HostsFile.add(body.target, body.source);
                status = 201;
            }
            return [response, status];
        },
        async PUT(body:any):Promise<[any, number]> {
            let response:any = {};
            let status;
            let configuration = HostsFile.json();
            let source = configuration[body.target];
            if(!source) {
                response.error = 'This Source does not exists';
                status = 500;
            } else {
                HostsFile.delete(body.target, source);
                HostsFile.add(body.target, body.source);
                status = 200;
            }
            return [response, status];
        }
    }
}
async function getBody(req:IncomingMessage) {
    return JSON.parse((await rawbody(req)).toString('utf-8'));
}
let server = createServer( async (req,res) => {
    let [_, mode] = req.url.toLowerCase().split('/');
    let BODY = {};
    if(['POST', 'PUT', 'DELETE'].includes(req.method))BODY = await getBody(req);
    let [response, status=200] = await managers[mode][req.method](BODY);
    res.setHeader('content-type', 'application/json');
    res.statusCode = status;
    res.end(JSON.stringify(response));
});

server.listen(6060);