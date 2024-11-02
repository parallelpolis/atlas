import { Atlas } from './atlas.js';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as yaml from 'js-yaml';

const atlas = new Atlas();
await atlas.init();

//const videos = await atlas.dumpCollection('archive');

const storageIndexResp = await fetch('https://archive.pp0.co/index.json')
const storageIndex = await storageIndexResp.json()


let totalUpdated = 0
let totalBinded = 0
for (const ai of atlas.collections.archive.items) {
    for (const l of ai.lists) {
        let changes = 0
        for (const i of l.originalData) {
            const storage = storageIndex.videos.find(si => si.id === i.id)
            if (JSON.stringify(i.storage) !== JSON.stringify(storage)) {
                i.storage = storage
                changes++
            }
            if (storage) {
                totalBinded++
            }
        }
        if (changes > 0) {
            fs.writeFileSync(path.join('./src', 'archive', ai.id, 'collections', `${l.id}.json`), JSON.stringify(l.originalData, null, 2));
            totalUpdated += changes
        }
    }
}

console.log(`done. videos updated = ${totalUpdated}, total binded = ${totalBinded}`)

/*for (const v of storageIndex.videos) {
    if (item) {
    }
}*/