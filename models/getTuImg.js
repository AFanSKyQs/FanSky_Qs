import fs from "fs";
let BgImgPath=`${process.cwd()}/plugins/FanSky_Qs/resources/Card/bg/`
let TuImg=`${process.cwd()}/plugins/FanSky_Qs/resources/Card/TuImg/`
let ByPath=`${process.cwd()}/plugins/FanSky_Qs/resources/Card/bg/by.jpg`
let AcgBg=`${process.cwd()}/plugins/FanSky_Qs/resources/Card/acgBg/`
export async function getBgImg(){
    // 头像框随机数字1或2
    let Num=Math.floor(Math.random() * 2) + 1
    let ImgList=["dayL","fire","Kingimg","name","SaLou","star","Yuan",`Txk${Num}`]
    // BgImgPath为图片文件夹，ImgList为图片文件夹下的图片名，遍历ImgList，将图片名和图片文件夹拼接成完整路径，放入数组
    let ImgPath=ImgList.map((item)=>{
        return BgImgPath + item + ".png"
    })
    ImgPath=ImgPath.map((item)=>{
        // 依次将\替换成/
        return item.replace(/\\/g, "/")
    })
    return ImgPath
}
export async function getTuImg () {
    let TuImgNum=fs.readdirSync(TuImg).length
    if(!TuImgNum || TuImgNum === 0){
        TuImgNum=2
    }
    let Num=Math.floor(Math.random() * TuImgNum) + 1
    let Tu= TuImg +`tu${Num}.png`
    return Tu.replace(/\\/g, "/")
}
export async function getByImg(){
    // 将路径里面所有的\替换成/
    return ByPath.replace(/\\/g, "/")
}
export async function getAcgBg(){
    let AcgBgNum=fs.readdirSync(AcgBg).length
    if(!AcgBgNum || AcgBgNum === 0){
        AcgBgNum=2
    }
    let AcgNum=Math.floor(Math.random() * AcgBgNum) + 1
    let Acg= AcgBg +`acg_${AcgNum}.jpg`
    return Acg.replace(/\\/g, "/")
}