import DefaultEngine from './default.js';
import { convert } from '../image.js';

const sizes = [
    ["s", 260],
    ["m", 500],
    //["l", 1000],
]

const sizesProject = [
    ["s", 260, { fixed: true }],
    ["m", 500, { fixed: true }],
    //["l", 1000],
]

export default class Engine extends DefaultEngine {

    async itemMap(item, { events, archive }) {
        const { path } = this.utils;
        // process images
        if (item.img) {
            const src = path.join(this.colDir, item.id, item.img);
            const dest = path.join(this.colDir, '_resized');
            const { hash } = await convert(sizes, item.id, src, dest);
            item.imgHash = hash
        }
        delete item.img;

        // project images
        if (item.projects) {
            for (const p of item.projects) {
                if (p.img) {
                    const src = path.join(this.colDir, item.id, p.img);
                    const dest = path.join(this.colDir, '_resized');
                    const { hash } = await convert(sizesProject, p.id, src, dest);
                    p.imgHash = hash
                }
            }
        }

        return item
    }

    async build({ outDir }) {
        const { fs, path } = this.utils;
        const src = path.join(this.colDir, '_resized');
        const dest = path.join(outDir, 'img', this.colName);
        fs.cpSync(src, dest, { recursive: true })
    }
}