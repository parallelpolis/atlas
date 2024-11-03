import { load, dump } from 'js-yaml';
import * as fs from 'node:fs';
import { createHash } from 'node:crypto';
import * as path from 'node:path';
import slugify from 'slugify';
import 'dotenv/config'

const apiKey = process.env.YT_API_KEY


async function getDetail(videoId) {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`
    const out = await download(url)
    return out?.items[0]
}

async function getResults(type = "channel", youtubeId, next) {
    let url;
    if (type === "playlist") {
        url = `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet,id&playlistId=${youtubeId}&maxResults=50&pageToken=${next}&key=${apiKey}`;
    } else if (type === "channel") {
        url = `https://youtube.googleapis.com/youtube/v3/search?part=snippet,id&channelId=${youtubeId}&maxResults=50&type=video&pageToken=${next}&key=${apiKey}`;
    } else {
        url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,id,contentDetails&id=${youtubeId}&key=${apiKey}`
    }
    return download(url)
}

function processDescription(obj, str) {
    if (obj.event === 'hcpp17') {
        const talkStart = str.indexOf('TALK:');
        const aboutStart = str.indexOf('ABOUT HCPP17');

        if (talkStart !== -1 && aboutStart !== -1) {
            const talkSection = str.substring(talkStart, aboutStart);
            const descriptionStart = 0 //talkSection.indexOf('Cryptocurrencies');

            // Extract the description without the title
            return talkSection.substring(descriptionStart).split('\n').slice(1).join('\n').trim();
        }
    }
    if (obj.event === 'hcpp16') {
        if (str.indexOf('http://bit.ly/playlistHCPP16') !== -1) {
            return str.split('http://bit.ly/playlistHCPP16')[1].trim()
        }
    }
    return str.split('▲▲▲')[0]
}

function decodeHtmlEntities(text) {
    const htmlEntities = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&apos;': "'",
        '&#39;': "'",
        // Add more entities as needed
    };

    return text.replace(/&[a-zA-Z0-9#]+;/g, (match) => htmlEntities[match] || match);
}

function toTitleCase(text) {
    // Decode HTML entities
    const decodedText = decodeHtmlEntities(text);

    return decodedText
        .toLowerCase() // Convert the entire string to lowercase
        .split(' ') // Split the string into words
        .map(word => {
            // Capitalize the first letter of each significant word
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' '); // Join the words back into a single string
}

function parseYouTubeDuration(duration) {
    let match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    let hours = (match[1] || '0H').slice(0, -1);
    let minutes = (match[2] || '0M').slice(0, -1);
    let seconds = (match[3] || '0S').slice(0, -1);

    return (parseInt(hours) * 3600) + (parseInt(minutes) * 60) + parseInt(seconds);
}


async function scan(conf, type, youtubeId, base = {}) {

    const [target, collection] = conf.split(':')
    const targetDir = path.join('./src/archive', target)
    let out = [];
    let next = "";
    while (next !== false) {

        const json = await getResults(type, youtubeId, next)
        if (!json) {
            break
        }

        next = json.nextPageToken || false

        for (const i of json.items) {
            const videoId = i.id?.videoId || i.snippet.resourceId?.videoId || i.id;
            let header = JSON.parse(JSON.stringify(base))

            if (out.find(i => i.videoId === videoId)) {
                continue
            }

            if (header) {
                if (!header.name) {
                    header.name = i.snippet.title
                }

                const slugName = slugify(header.name, { lower: true, strict: true });
                const slug = `${header.event ? header.event + '-' : ''}${slugName}`;
                const id = videoId;

                // get video details
                const detail = await getDetail(videoId)
                if (!detail) {
                    console.error(`no snippet??! ${videoId}`)
                    continue;
                    //throw new Error()
                }

                // download thumbnail
                const img = `${id}.jpg`;
                const thumbFn = path.join(targetDir, 'assets', img);
                if (!fs.existsSync(thumbFn)) {
                    const thumb = await fetch((detail.snippet.thumbnails.maxres || detail.snippet.thumbnails.high).url);
                    fs.writeFileSync(thumbFn, Buffer.from(await thumb.arrayBuffer()))
                    console.log(`writed img: ${thumbFn}`)
                }

                // done
                out.push({
                    id,
                    slug,
                    videoId,
                    url: "https://www.youtube.com/watch?v=" + videoId,
                    publishedAt: i.snippet.publishedAt || new Date('2015-01-01'),
                    desc: processDescription(header, detail.snippet.description),
                    duration: parseYouTubeDuration(detail.contentDetails.duration),
                    ...header,
                })
                //processed.push(videoId)

            } else if (header === false) {
                console.error(`Unknown title: ${i.snippet.title}`)
                //console.log(i.snippet.title)
            }
        }
    }
    const outFile = path.join(targetDir, 'collections', `${collection || 'tmp'}.json`)
    fs.writeFileSync(outFile, JSON.stringify(out, null, 2))
    console.log(`writed: ${outFile}`)

    return out
}

async function download(url) {

    const hash = createHash("sha256");
    hash.update(url);
    const digest = hash.digest('hex');
    //console.log({ url, digest })

    const tmpDir = './tmp/yt';
    if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true })
    }
    const tmpFile = path.join(tmpDir, digest);
    if (fs.existsSync(tmpFile)) {
        return JSON.parse(fs.readFileSync(tmpFile));
    }

    const res = await fetch(url);
    const json = await res.json();

    if (json.error) {
        throw new Error(JSON.stringify(json.error, null, 2));
    }

    fs.writeFileSync(tmpFile, JSON.stringify(json, null, 2));
    return json;
}

// ----- run

const target = process.argv[2]
const type = process.argv[3]
const id = process.argv[4]
const base = process.argv[5] ? JSON.parse(process.argv[5]) : {}

if (!target || !type || !id) {
    console.error('bad arguments')
    console.log('\nusage:\n  node lib/yt-extract.js <target> <type> <id>\n\nfor example:\n  make yt-extract pp-prague playlist PLmwDL0lIJTxCc0yL4i9M2aNQ4a5wRzjb7')
}

switch (type) {
    case 'playlist':
        await scan(target, type, id, base)
        break;
}