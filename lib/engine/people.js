import DefaultEngine from './default.js';
import { convert } from '../image.js';

export default class Engine extends DefaultEngine {

    async itemMap(p, { events, archive }) {

        const { path } = this.utils;

        // calculate merit
        p.merit = Number((p.roles?.length || 0) * 3) +
            (events.filter(e => e.speakers?.includes(p.id)).length * 1) +
            (archive.filter(i => i.people?.map(p => p.split('|').at(-1)).includes(p.id)).length * 2);

        // process images
        if (p.img) {
            const { hash } = await convert(
                p,
                path.join(this.colDir, 'assets', p.img),
                path.join(this.colDir, 'assets', '_resized'),
            );
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