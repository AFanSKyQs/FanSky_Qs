import axios from "axios";

export async function getUrlJson(URL, e) {

    //node-fetch请求方式（node版本小于18不能用）
    // let res = await fetch(URL).catch((err) => logger.error(err))
    // if (!res) {
    //     logger.error(`${URL}请求失败...`)
    //     return await e.reply(`${URL}\n请求失败~~`)
    // }
    // let json = await res.json()
    // // console.log(json)
    // return json

    try {
        const res = await axios.get(URL)
        // console.log(json)
        const json = res.data
        return json
    } catch (error) {
        console.log(error)
        console.log(`${URL}请求失败...`)
        return await e.reply(`${URL}\n请求失败~~`)
    }
}
