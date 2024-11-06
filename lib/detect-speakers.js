import { Atlas } from "./atlas.js";
import { dump } from 'js-yaml';

const atlas = new Atlas();
await atlas.init();

const { archive, people, events } = await atlas.dump();

const eventSpeakers = {}
for (const e of events) {
    eventSpeakers[e.id] = e.speakers || []
}

let changedEvents = []
for (const e of archive) {
    if (!e.event) {
        continue
    }
    let changed = false;
    for (const p of e.people) {
        const id = p.split('|').at(-1)
        if (!eventSpeakers[e.event].includes(id)) {
            eventSpeakers[e.event].push(id)
            if (!changedEvents.includes(e.event)) {
                changedEvents.push(e.event)
            }
        }
    }
}

let count = 1;
for (const id of changedEvents) {
    const event = events.find(x => x.id === id)
    console.log(`[${count}] event: ${id} (${event.date})\n  speakers:\n    ${dump(eventSpeakers[id]).split('\n').join('\n    ')}`)
    count++
}