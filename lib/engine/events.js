import DefaultEngine from './default.js';
import { convert } from '../image.js';

const sizes = [
    ["s", 260],
    ["m", 500],
    ["l", 1000],
]

export default class Engine extends DefaultEngine {

    async itemMap(p, { events, archive }) {

        const { path } = this.utils;

        // process images
        for (const img of (p.imgs || [])) {
            const src = path.join(this.colDir, 'assets', img.path);
            const dest = path.join(this.colDir, 'assets', '_resized');
            const { hash } = await convert(sizes, p.id, src, dest);
            img.hash = hash
        }
        return p
    }

    async build({ outDir }) {
        const { fs, path } = this.utils;
        fs.cpSync(
            path.join(this.colDir, 'assets'),
            path.join(outDir, 'img', this.colName),
            {
                recursive: true,
                filter: (src) => !src.match(/assets\/_resized/)
            }
        )
        fs.cpSync(
            path.join(this.colDir, 'assets', '_resized'),
            path.join(outDir, 'img', this.colName),
            { recursive: true }
        )
    }
}