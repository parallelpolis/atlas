import { join, parse } from "node:path"
//import { readdir, mkdir, stat } from "bun";
import * as fs from "node:fs";
import { createHash } from "node:crypto"
import sharp from "sharp"

export async function convert(sizes, fn, src, outputDir) {
    const fileBuffer = fs.readFileSync(src);
    const hash = await calculateHash(fileBuffer);
    const metaFn = join(outputDir, `${fn}.sha256`);

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir)
    }
    let latestHash = null
    if (fs.existsSync(metaFn)) {
        latestHash = fs.readFileSync(metaFn)
    }
    if (latestHash === hash) {
        return
    }

    const img = sharp(fileBuffer)
    const imgMetadata = await img.metadata();

    const imgResized = {}
    for (const [sizeName, size, sc = {}] of sizes) {
        const resizedOutputPath = join(outputDir, sizeName)
        if (!fs.existsSync(resizedOutputPath)) {
            fs.mkdirSync(resizedOutputPath)
        }
        const resizedOutputFn = join(resizedOutputPath, `${hash}.webp`)
        if (fs.existsSync(resizedOutputFn)) {
            continue;
        }
        // Determine new dimensions while preserving aspect ratio
        const aspectRatio = imgMetadata.width / imgMetadata.height;
        const sizeOut = []
        let width, height;
        if (aspectRatio > 1) {
            // Landscape or square
            width = size;
            height = Math.round(size / aspectRatio);
        } else {
            // Portrait
            width = Math.round(size * aspectRatio);
            height = size;
        }

        const resizedImg = await img.clone()
            .resize({
                width: sc.fixed ? size : width,
                height: sc.fixed ? size : height,
                fit: 'cover',
                position: 'center',
                //withoutEnlargement: true,
            })
            .webp({ quality: 80 })
            .toBuffer()

        fs.writeFileSync(resizedOutputFn, resizedImg)
        console.log(`writed: ${resizedOutputFn}`)
        sizeOut[sizeName] = hash;
    }

    fs.writeFileSync(metaFn, hash);

    return {
        hash
    }
}

async function calculateHash(fileBuffer) {
    const hash = createHash("sha256")
    hash.update(fileBuffer)
    const hexHash = hash.digest("hex")
    return hexHash
}