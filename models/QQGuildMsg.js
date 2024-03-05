import fs from 'fs'
export async function QQGuildImg(e,path){
    const imgData = fs.readFileSync(path, { encoding: 'base64' });
    await e.reply(segment.image(`base64://${imgData}`));
    return true
}