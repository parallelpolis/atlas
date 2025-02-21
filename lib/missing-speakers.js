import { Atlas } from "./atlas.js";
import { dump } from 'js-yaml';

const atlas = new Atlas();
await atlas.init();

const { archive, people, events } = await atlas.dump();

const stats = {}

for (const e of archive) {
    if (!e.people) {
        continue
    }
    for (const s of e.people) {
        const id = s.split('|').at(-1)
        const found = people.find(p => p.id === id)
        if (found) {
            continue
        }

        if (!stats[id]) {
            stats[id] = 0
        }
        stats[id]++
    }
}

const sorted = Object.entries(stats).sort((x, y) => x[1] > y[1] ? 1 : -1)
for (const l of sorted) {
    console.log(l)
}