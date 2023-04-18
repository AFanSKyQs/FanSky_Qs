import fs from "fs";

let path = `${process.cwd()}/resources/FanSky/SignIn.json`
let NoAccount = "您还没有魔晶账户，本次无奖励\n可发送[打卡]来开启您的魔晶账户"

export async function AddMagic(e, AddNum) {
    if (!fs.existsSync(path)) {
        return {
            status: "error",
            Tips: NoAccount
        }
    }
    let SignDay = JSON.parse(fs.readFileSync(path));
    if (!SignDay[e.user_id]) {
        return {
            status: "error",
            Tips: NoAccount
        }
    }
    SignDay[e.user_id].rough += AddNum;
    fs.writeFileSync(path, JSON.stringify(SignDay));
    return {
        status: "success",
        Tips: `魔晶+${AddNum}\n当前总计：${SignDay[e.user_id].rough}`
    }
}