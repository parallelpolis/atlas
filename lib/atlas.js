import * as fs from 'node:fs';
import * as path from 'node:path';
import * as yaml from 'js-yaml';

const srcDir = "./src";

export class Atlas {

    constructor() {
        this.collections = {};
        this.spec = yaml.load(fs.readFileSync('./atlas-spec.yaml'))
    }

    async init() {
        for (const colName of Object.keys(this.spec.collections)) {
            this.collections[colName] = this.loadCollection(colName)
        }
    }

    loadCollection(colName, full = false) {
        const items = []
        const colDir = path.join(srcDir, colName);
        for (const fn of fs.readdirSync(colDir)) {
            const fullFn = path.join(colDir, fn);
            const id = fn;
            const indexFn = path.join(colDir, id, 'index.yaml');
            const index = yaml.load(fs.readFileSync(indexFn));
            items.push({
                id,
                ...index
            });
        }
        return {
            items
        }
    }

    dump() {
        return Object.assign({
            ...Object.fromEntries(Object.keys(this.collections).map(colName => [colName, this.collections[colName].items])),
            generatedAt: new Date().toISOString()
        })
    }
}