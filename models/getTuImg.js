import fs from "fs";
import path from "path"

let BgImgPath = `${process.cwd()}/plugins/FanSky_Qs/resources/Card/bg/`
let TuImg = `${process.cwd()}/plugins/FanSky_Qs/resources/Card/TuImg/`
let ByPath = `${process.cwd()}/plugins/FanSky_Qs/resources/Card/bg/by.jpg`
let AcgBg = `${process.cwd()}/plugins/FanSky_Qs/resources/Card/acgBg/`
let Top = `${process.cwd()}/plugins/FanSky_Qs/resources/ChestAchieveTop/img/`
let helpBg = `${process.cwd()}/plugins/FanSky_Qs/resources/help/img/bg/`
export async function getBgImg() {
    // 头像框随机数字1或2
    let Num = Math.floor(Math.random() * 2) + 1
    let ImgList = ["dayL", "fire", "Kingimg", "name", "SaLou", "star", "Yuan", `Txk${Num}`]
    // BgImgPath为图片文件夹，ImgList为图片文件夹下的图片名，遍历ImgList，将图片名和图片文件夹拼接成完整路径，放入数组
    let ImgPath = ImgList.map((item) => {
        return BgImgPath + item + ".png"
    })
    ImgPath = ImgPath.map((item) => {
        // 依次将\替换成/
        return item.replace(/\\/g, "/")
    })
    return ImgPath
}

export async function getByImg() {
    // 将路径里面所有的\替换成/
    return ByPath.replace(/\\/g, "/")
}
export async function getChestAndAchieve() {
    const files = fs.readdirSync(Top);
    const randomIndex = Math.floor(Math.random() * files.length);
    const randomFile = files[randomIndex];
    return path.join(Top, randomFile).replace(/\\/g, "/")
}
export async function getAcgBg() {
    const files = fs.readdirSync(AcgBg);
    const randomIndex = Math.floor(Math.random() * files.length);
    const randomFile = files[randomIndex];
    return path.join(AcgBg, randomFile).replace(/\\/g, "/")
}
export async function getHelpBg() {
    const files = fs.readdirSync(helpBg);
    const randomIndex = Math.floor(Math.random() * files.length);
    const randomFile = files[randomIndex];
    return path.join(helpBg, randomFile).replace(/\\/g, "/")
}