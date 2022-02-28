const inquirer = require("inquirer");
const { Base64 } = require('js-base64');
const fs = require('fs');
const os = require('os'); 
const path = require('path'); 

const PRIORITY = {
    "VIDEO": [
        337, 315, 266, 138, // 2160p60
        313, 336, // 2160p
        308, // 1440p60
        271, 264, // 1440p
        335, 303, 299, // 1080p60
        248, 169, 137, // 1080p
        334, 302, 298, // 720p60
        247, 136 // 720p
    ]
}

async function ask(q) {
    const data = await inquirer.prompt([
        {
            type: 'input',
            name: 'data',
            message: q
        }
    ]);
    return data.data;
}

(async () => {
    let data;
    data = await ask("Data 1 filepath:");
    data = Base64.decode(fs.readFileSync(data, 'utf8'));

    const regex = /"itag":(?<itag>\d+),"url":"(?<url>[^"]+)"/g
    const regexInner = /"itag":(?<itag>\d+),"url":"(?<url>[^"]+)"/
    const match = data.match(regex);
    const result = {}
    for (const x of match) {
        const tmp = x.match(regexInner).groups;
        result[tmp.itag] = tmp.url.replaceAll('\\u0026', "&")
    }
    for (const itag of PRIORITY.VIDEO) {
        if (Object.keys(result).includes(itag.toString()) && result[itag.toString()].includes("noclen")) {
            const videoUrl = new URL(result[itag.toString()]);
            videoUrl.searchParams.set("sq", 0);
            console.log(videoUrl.href);
            break;
        }
    }
    
    data = await ask("Data 2 filepath:");
    data = Base64.toUint8Array(fs.readFileSync(data, 'utf8'));
    const tsFile = path.join(os.tmpdir(), `${Date.now()}.ts`);
    fs.appendFileSync(tsFile, Buffer.from(data));
    console.log(tsFile);
})()