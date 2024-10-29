import * as fs from 'node:fs';
import * as path from 'node:path';
import * as yaml from 'js-yaml';

const srcDir = "./src";

export class Atlas {

    constructor() {
        this.collections = {};
        this.spec = yaml.load(fs.readFileSync('./atlas-spec.yaml'))
        this.utils = {
            fs,
            path,
            yaml
        }
    }

    async init() {
        for (const colName of Object.keys(this.spec.collections)) {
            this.collections[colName] = await this.loadCollection(colName)
        }
    }

    async loadCollection(colName, full = false) {
        const config = this.spec.collections[colName] || {};
        const colDir = path.join(srcDir, colName);

        const { default: Engine } = await import(`./engine/${config.engine || 'default'}.js`);
        const engine = new Engine(this, { config, colDir, colName });
        await engine.load();
        return engine
    }

    async dumpCollection(colName) {
        const col = typeof (colName) === "object" ? colName : this.collections[colName];
        return col.dump()
    }

    async dump() {
        const output = {};
        for (const colName of Object.keys(this.collections)) {
            output[colName] = await this.collections[colName].dump()
        }
        output.generatedAt = new Date().toISOString();
        return output
        /*return Object.assign({
            ...Object.fromEntries(Object.keys(this.collections).map(colName => [colName, this.dumpCollection(colName)])),
        })*/
    }

    loadYaml(fn) {
        return yaml.load(fs.readFileSync(fn));
    }
}