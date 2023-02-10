import fetch from "node-fetch";

export async function getUrlJson(URL, e) {
    let res = await fetch(URL).catch((err) => logger.error(err))
    if (!res) {
        logger.error(`${URL}请求失败...`)
        return await e.reply(`${URL}\n请求失败~~`)
    }
    let json = await res.json()
    console.log(json)
    return json
}
