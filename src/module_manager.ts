import { join } from "path";
import { watch, FSWatcher } from "chokidar";
import { readFileSync, createWriteStream, existsSync, mkdirSync, writeFileSync } from "fs";
import * as yaml from 'js-yaml';

const KRBP = join('c:', 'kaen-redbird');

if (!existsSync(KRBP)) {
    mkdirSync(KRBP);
    writeFileSync(join(KRBP, 'hosts.yaml'), 'redbird.kaen.conf: 127.0.0.1\n');
    writeFileSync(join(KRBP, 'proxy.yaml'), '');
}

let log = createWriteStream(join(KRBP, 'error.log'));
export class ModuleManager<T> {
    values:Map<string, T> = new Map();
    temp:Map<string, T> = new Map();
    get filepath () {
        return join(KRBP, this.file);
    }
    watcher: FSWatcher;
    constructor(private file:string) {
        this.watcher = watch(this.filepath, {
            awaitWriteFinish: {
                stabilityThreshold: 300,
                pollInterval: 100
            },
            ignoreInitial: false
        })
        .on('all', (event, path) => {
            this.temp.clear();
            this.load().forEach(line=>{
                this.temp.set(line[0], line[1]);
            });
            // Find new Keys
            for(const [key, val] of this.temp.entries()) {
                if( !this.values.has(key) ) {
                    this.values.set(key, val);
                    this.set(key, val);
                }
            }
            for(const [key, val] of this.values.entries()) {
                if( !this.temp.has(key) ) {
                    this.values.delete(key);
                    this.remove(key, val);
                }
            }
            this.temp.clear();
        });
    }
    load() {
        try {
            const file = readFileSync(this.filepath, 'utf8');
            var doc = yaml.safeLoad(file);
            return Object.keys(doc).map(k=>[k, doc[k]]) as [string, T][];
        } catch (e) {
            log.write(e+'\n\n');
            return [] as [string, T][];
        }
    }
    set(key:string, value:T) {}
    remove(key:string, value?:T) {}
}