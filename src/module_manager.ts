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
            this.findNewKeys();
            this.findRemoedKeys();
            this.findChangedKeys();
            this.temp.clear();
        });
    }
    findChangedKeys() {
        for(const [key, val] of this.temp.entries()) {
            let original = JSON.stringify(this.values.get(key));
            let current = JSON.stringify(this.temp.get(key));
            if(original !== current) {
                const o = this.values.get(key);
                const c = this.temp.get(key);
                this.values.set(key, c);
                this.remove(key, o);
                this.set(key, c);
            }
        }
    }
    findNewKeys () {
        for(const [key, val] of this.temp.entries()) {
            if( !this.values.has(key) ) {
                this.values.set(key, val);
                this.set(key, val);
            }
        }
    }
    findRemoedKeys() {
        for(const [key, val] of this.values.entries()) {
            if( !this.temp.has(key) ) {
                this.values.delete(key);
                this.remove(key, val);
            }
        }
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