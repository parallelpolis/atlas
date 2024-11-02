import DefaultEngine from './default.js';
import { convert } from '../image.js';

const sizes = [
    ["s", 260],
    ["m", 500],
    ["l", 1200],
]

export default class Engine extends DefaultEngine {

    async load() {
        const { fs, path, yaml } = this.utils;
        const colDir = this.colDir;
        const dump = await this.atlas.dump();

        const items = []
        for (const fn of fs.readdirSync(colDir)) {
            const fullFn = path.join(colDir, fn);
            const id = fn;
            const indexFn = path.join(colDir, id, 'index.yaml');
            const index = yaml.load(fs.readFileSync(indexFn));
            const self = this;

            for (const l of index.lists) {
                const listFn = path.join(colDir, id, 'collections', `${l.id}.json`);
                if (!fs.existsSync(listFn)) {
                    continue
                }
                l.originalData = JSON.parse(fs.readFileSync(listFn))
                let data = JSON.parse(JSON.stringify(l.originalData))
                if (self.itemMap) {
                    const newData = []
                    for (const i of data) {
                        i.target = id;
                        newData.push(await self.itemMap(i, dump))
                    }
                    data = newData;
                }
                l.data = data;
            }
            items.push({
                id,
                ...index,
            });
        }
        this.items = items;
    }

    async dump() {
        const items = [];
        for (const ai of this.items) {
            items.push(...ai.lists.map(l => l.data).flat().map(i => Object.assign({ target: ai.id }, i)))
        }
        return items.sort((x, y) =>
            y.publishedAt > x.publishedAt ? 1 : -1,
        )
    }

    async itemMap(p, { events, archive }) {
        const { path } = this.utils;

        // process images
        //console.log(p)
        //if (p.img) {
        const src = path.join(this.colDir, p.target, 'assets', `${p.id}.jpg`);
        const dest = path.join(this.colDir, p.target, 'assets', '_resized');
        const { hash } = await convert(sizes, p, src, dest);
        p.imgHash = hash
        //}
        //delete p.img;
        return p
    }

    async build({ outDir }) {
        const { fs, path } = this.utils;
        const dump = await this.atlas.dumpCollection(archive);

        const src = path.join(this.colDir, 'assets', '_resized');
        const dest = path.join(outDir, 'img', this.colName);
        fs.cpSync(src, dest, { recursive: true })
    }

    async build({ outDir }) {
        const { path, fs } = this.utils;
        for (const target of fs.readdirSync(this.colDir)) {
            const src = path.join(this.colDir, target, 'assets', '_resized');
            const dest = path.join(outDir, 'img', this.colName);
            fs.cpSync(src, dest, { recursive: true })
        }
    }
}