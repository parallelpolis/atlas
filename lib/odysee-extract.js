import * as path from 'node:path';
import slugify from 'slugify';
import * as fs from 'node:fs';
import { exec } from 'node:child_process';

const peopleMatrix = [
    ["Sodomák I ", "sodomak"],
    ["Sodomák ｜ ", "sodomak"],
    ["Sara Polak ｜ ", "sara-polak"],
    ["Sara Polak I ", "sara-polak"],
    ["Josef Tětek I ", false],
    ["Josef Tětek ｜ ", false],
    ["HCPP20 -", false],
    ["HCPP20 ｜ ", false],
    ["Mário Havel： ", "mario-havel"],
    ["Mário Havel ｜ ", "mario-havel"],
    ["Roman Týc I ", "roman-tyc"],
    ["Roman Týc ｜ ", "roman-tyc"],
    ["Martin Tremčinský ｜ ", "martin-tremcinsky"],
]

async function getItems (channelId, page = 1) {
    const url = "https://api.na-backend.odysee.com/api/v1/proxy?m=claim_search";
    
    // The same request body as your cURL command
    const body = {
      "jsonrpc": "2.0",
      "method": "claim_search",
      "params": {
        "page_size": 100,
        "page": page,
        "claim_type": ["stream", "repost"],
        "no_totals": true,
        "not_tags": [
          "porn",
          "porno",
          "nsfw",
          "mature",
          "xxx",
          "sex",
          "creampie",
          "blowjob",
          "handjob",
          "boobs",
          "big boobs",
          "big dick",
          "pussy",
          "cumshot",
          "anal",
          "hard fucking",
          "ass",
          "fuck",
          "hentai"
        ],
        "order_by": ["release_time"],
        "has_source": true,
        "channel_ids": [channelId],
        "release_time": "<1740268020"
      },
      "id": Math.floor(Date.now() / 1000)
    };
  
    // Set up headers matching the cURL request
    const headers = {
      "accept": "*/*",
      "accept-language": "en-US,en;q=0.9",
      "content-type": "application/json-rpc",
      "dnt": "1",
      "origin": "https://odysee.com",
      "priority": "u=1, i",
      "referer": "https://odysee.com/",
      "sec-ch-ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"macOS\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
      "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36"
    };
  
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body)
      });
  
      if (!response.ok) {
        throw new Error(`Request failed with status: ${response.status}`);
      }
  
      const data = await response.json();
      return data.result.items;
    } catch (error) {
      console.error("Error during fetch:", error);
    }
  }

export async function saveFirstFrame(videoUrl, outputFile) {
    return new Promise((resolve, reject) => {
      // -f best: Download best available quality
      // -o -   : Output to stdout
      // pipe:0 : Instruct ffmpeg to read from stdin
      // -frames:v 1: Only capture one frame
      // -y: Overwrite outputFile if it exists
      const command = `
        yt-dlp -f best -o - "${videoUrl}" |
        ffmpeg -i pipe:0 -ss 5 -frames:v 1 -y "${outputFile}"
      `;
  
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve(`Saved first frame to "${outputFile}".`);
        }
      });
    });
  }

// RUN
// ------

const target = process.argv[2]
const channelId = process.argv[3]
const collection = process.argv[4]

if (!target) {
    console.error('Please specify target')
    process.exit(1)
}
if (!channelId) {
    console.error('Please specify channelId')
    process.exit(1)
}

const targetDir = path.join('./src/archive', target)
  

const items = [
    ...(await getItems(channelId)),
    ...(await getItems(channelId, 2)),
    ...(await getItems(channelId, 3)),
    ...(await getItems(channelId, 4)),
    ...(await getItems(channelId, 5)),
]

const out = []

outerloop:
for (const i of items) {
    //console.log(i)
    const id = i.short_url.replace(/^lbry:\/\//, '');

    if (out.find(x => x.id === id)) {
        continue;
    }

    const url =  `https://odysee.com/${id}`;
    const people = [];
    let name = i.value.title;

    for (const [key,v] of peopleMatrix) {
        if (name.startsWith(key)) {
            if (v === false) {
                continue outerloop
            } else {
                people.push(v)
                name = name.replace(new RegExp(`^${key}`), '')
            }
        }
    }

    const thumbFn = path.join(targetDir, 'assets', `${id}.jpg`);
    if (!fs.existsSync(thumbFn)) {
        await saveFirstFrame(url, thumbFn);
    }

    const realName = name.replace('： ', ': ').replace(' ｜ ', ' | ')
    out.push({
        id,
        slug: slugify(realName, { lower: true, strict: true }),
        odyseeId: id,
        odyseeSourceHash: i.value.source.hash,
        url,
        publishedAt: new Date('2022-01-01').toISOString(), //new Date(i.timestamp * 1000).toISOString(),
        duration: i.value.video.duration,
        name: realName,
        desc: "",
        project: target,
        people,
        lang: "cs",
    })

}

const outFile = path.join(targetDir, 'collections', `${collection || 'tmp'}.json`)
fs.writeFileSync(outFile, JSON.stringify(out, null, 2))
console.log(`writed: ${outFile}`)

//console.log(out)