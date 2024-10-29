
export default class DefaultEngine {

    constructor(atlas, { config, colDir, colName }) {
        this.config = config;
        this.colDir = colDir;
        this.colName = colName;
        this.utils = atlas.utils;
        this.items = [];
    }

    async load() {
        const { fs, path, yaml } = this.utils;
        const colDir = this.colDir;

        const items = [];
        if (this.config.type === "flat") {
            for (const fn of fs.readdirSync(colDir)) {
                const data = yaml.load(fs.readFileSync(path.join(colDir, fn)));
                items.push(...data)
            }
        } else {
            for (const fn of fs.readdirSync(colDir)) {
                const fullFn = path.join(colDir, fn);
                const id = fn;
                const indexFn = path.join(colDir, id, 'index.yaml');
                const index = yaml.load(fs.readFileSync(indexFn));
                items.push({
                    id,
                    ...index
                });
            }
        }
        this.items = items;
    }

    async dump() {
        function sortArray(arr, [key, dir]) {
            return arr.sort((x, y) => (x[key] > y[key] ? (dir === 'desc' ? -1 : 1) : (dir === 'desc' ? 1 : -1)))
        }
        const items = this.config.sort ? sortArray(this.items, this.config.sort) : this.items;
        return JSON.parse(JSON.stringify(items));
    }
}

