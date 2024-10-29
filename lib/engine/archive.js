import DefaultEngine from './default.js';

export default class Engine extends DefaultEngine {

    async load() {
        const { fs, path, yaml } = this.utils;
        const colDir = this.colDir;

        const items = []
        for (const fn of fs.readdirSync(colDir)) {
            const fullFn = path.join(colDir, fn);
            const id = fn;
            const indexFn = path.join(colDir, id, 'index.yaml');
            const index = yaml.load(fs.readFileSync(indexFn));
            const lists = index.lists;
            items.push({
                id,
                ...index,
                lists: lists.map((l) => {
                    const listFn = path.join(colDir, id, 'collections', `${l.id}.json`);
                    if (fs.existsSync(listFn)) {
                        l.data = JSON.parse(fs.readFileSync(listFn));
                    }
                    return l
                })
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

    async build({ outDir }) {
        const { path, fs } = this.utils;
        const imgDir = path.join(outDir, 'img', this.colName);
        for (const i of await this.dump()) {
            if (i.img) {
                const destDir = path.join(imgDir, i.target);
                if (!fs.existsSync(destDir)) {
                    fs.mkdirSync(destDir, { recursive: true })
                }
                const destFn = path.join(destDir, i.img);
                if (!fs.existsSync(destFn)) {
                    fs.copyFileSync(path.join('./src', this.colName, i.target, 'assets', i.img), destFn);
                    //console.log(`Copied: ${destFn}`);
                }
            }
        }
    }
}