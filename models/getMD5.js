import fs from "fs";
import crypto from "crypto";
export async function getMd5File(path) {
    let md5Value
    fs.readFile(path, async function (err, data) {
        if (err) return;
        md5Value = crypto.createHash('md5').update(data, 'utf8').digest('hex');
        console.log(md5Value);
         md5Value = md5Value.toUpperCase();
        return  md5Value;
    });
    return md5Value;
}
