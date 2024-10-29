import DefaultEngine from './default.js';

export default class Engine extends DefaultEngine {

    async itemMap(p, { events, archive }) {
        p.merit = Number((p.roles?.length || 0) * 3) +
            (events.filter(e => e.speakers?.includes(p.id)).length * 1) +
            (archive.filter(i => i.people?.map(p => p.split('|').at(-1)).includes(p.id)).length * 2)
        return p
    }
}