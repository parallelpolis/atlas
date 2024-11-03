import DefaultEngine from './default.js';
import { convert } from '../image.js';

const sizes = [
    ["s", 260, { fixed: true }],
    ["m", 500, { fixed: true }],
    //["l", 1000],
]

export default class Engine extends DefaultEngine {

    async itemMap(p, { events, archive }) {

        const { path } = this.utils;

        // calculate merit
        p.merit = Number((p.roles?.length || 0) * 1.5) +
            (events.filter(e => e.speakers?.includes(p.id)).length * 1) +
            (archive.filter(i => i.lang !== "cs").filter(i => i.people?.map(p => p.split('|').at(-1)).includes(p.id)).length * 2) +
            (archive.filter(i => i.lang === "cs").filter(i => i.people?.map(p => p.split('|').at(-1)).includes(p.id)).length * 0.3)

        // process images
        if (p.img) {
            const src = path.join(this.colDir, 'assets', p.img);
            const dest = path.join(this.colDir, 'assets', '_resized');
            const { hash } = await convert(sizes, p.id, src, dest);
            p.imgHash = hash
        }
        delete p.img;
        return p
    }

    async build({ outDir }) {
        const { fs, path } = this.utils;
        const src = path.join(this.colDir, 'assets', '_resized');
        const dest = path.join(outDir, 'img', this.colName);
        fs.cpSync(src, dest, { recursive: true })
    }
}