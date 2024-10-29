import * as fs from "node:fs";
import { join } from "node:path";
import { Atlas } from "./atlas.js";

const atlas = new Atlas();
await atlas.init();

const destDir = './dist';

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir)
}
const output = atlas.dump()
const destFn = join(destDir, 'index.json')
fs.writeFileSync(destFn, JSON.stringify(output, null, 2))
console.log(`Writed: ${destFn}`)

// collections
for (const colName of Object.keys(atlas.collections)) {
    const destColDir = join(destDir, colName);
    if (!fs.existsSync(destColDir)) {
        fs.mkdirSync(destColDir)
    }
    const destColFn = join(destColDir, 'index.json')
    fs.writeFileSync(destColFn, JSON.stringify(atlas.collections[colName].items, null, 2))
    console.log(`Writed: ${destFn}`)
}

const destJsFn = join(destDir, 'atlas.js')
fs.writeFileSync(destJsFn, `export default ${JSON.stringify(output)};`)
console.log(`Writed: ${destJsFn}`)