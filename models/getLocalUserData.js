import fs from "fs";

let LocalUserData = (`${process.cwd()}/data/UserData`).replace(/\\/g, '/')

export async function getLocalUserData(e, uid) {
    let UidData = `${LocalUserData}/${uid}.json`
    if (!fs.existsSync(UidData)) {
        return null
    }

    return await JSON.parse(fs.readFileSync(UidData, 'utf-8'))
}