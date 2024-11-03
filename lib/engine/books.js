import DefaultEngine from './default.js';
import { convert } from '../image.js';

const sizes = [
    ["s", 260],
    ["m", 500],
    //["l", 1000],
]

export default class Engine extends DefaultEngine {

    async itemMap(p, { events, archive }) {

        const { path } = this.utils;

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