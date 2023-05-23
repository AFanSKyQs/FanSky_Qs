import fs from "fs";
import {getQQ} from "../../models/getQQ.js";

let _path = `${process.cwd()}/resources/FanSky`
let path = `${process.cwd()}/resources/FanSky/SignIn.json`

export async function AddMagicCrystal(e) {
    let UserQQ
    const msg = (e.msg || e.original_msg || e.raw_message) + '';
    const match = /^#(减|减少|扣|扣除|加|充|增|增加|添加|充值)(魔晶|魔石|石头)(\d+)\s*(\d*)/u.exec(msg)
    if (!match) {
        await e.reply("未识别到操作指令喵！");
        return false;
    }
    let [_, action, targetType, targetObject, targetCount] = match;
    UserQQ = targetObject
    if (await getQQ(e) !== null) {
        UserQQ = await getQQ(e)
        targetCount = targetObject
    }
    if (!UserQQ) {
        await e.reply("未检测到要加魔晶的对象喵！");
        return false;
    }
    const numTarget = Number(UserQQ);
    if (isNaN(numTarget)) {
        await e.reply(`${targetType || '魔晶'}[${UserQQ}]不是合法的数字喵！`);
        return false;
    }
    const Status=await CheckUser(Number(UserQQ))
    if(Status.Sts==="无"){
        await e.reply("暂无该用户魔晶账号\n请该用户先使用[ 打卡 ]注册账户喵！");
        return false;
    }
    let SignDay =JSON.parse(fs.readFileSync(path));
    let AddMagicCrystal = 0
    if (action === '加' || action === '充' || action === '增' || action === '增加' || action === '添加' || action === '充值') {
        SignDay[UserQQ].rough += Number(targetCount || 100);
        await e.reply(`已将[${numTarget}]${targetType || '魔晶'}增加[${targetCount || 100}]喵！\n当前魔晶余额为[${SignDay[UserQQ].rough}]喵！`);
    } else {
        SignDay[UserQQ].rough -= Number(targetCount || 100);
        await e.reply(`已将[${numTarget}]${targetType || '魔晶'}扣除${targetCount || 100}喵！\n当前魔晶余额为[${SignDay[UserQQ].rough}]喵！`);
    }
    await fs.writeFileSync(path, JSON.stringify(SignDay));
    return true;
}

async function CheckUser(UserQQ) {
    if (!fs.existsSync(_path)) {
        fs.mkdirSync(_path);
    }
    if (!fs.existsSync(path)) {
        fs.writeFileSync(path, '{}');
    }
    let SignDay = JSON.parse(fs.readFileSync(path));
    if (!SignDay[UserQQ]) {
        return {Sts: "无"};
    }
    return {Sts: "有"};
}
