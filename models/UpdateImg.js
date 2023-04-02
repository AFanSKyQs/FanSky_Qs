import {exec} from "child_process";
import fs from "fs";

let gitDio = "https://gitee.com/FanSky_Qs/fan-sky-qs-dio-tu.git"
let gitLong = "https://gitee.com/FanSky_Qs/fan-sky-qs-long-tu.git"

let cwd = process.cwd().replace(/\\/g, "/")
let FanSkyPath = cwd + "/plugins/FanSky_Qs/resources/GitImg/"


export async function updateDioTu(e) {
    if (!e.isMaster) {
        e.reply(`[FanSky_Qs]主人，您没有权限哦~`);
        return true
    }
    await updateImg(e, "DioTu", "d图", gitDio, "gitDio")
    return true
}

export async function updateLongTu(e) {
    if (!e.isMaster) {
        e.reply(`[FanSky_Qs]主人，您没有权限哦~`);
        return true
    }
    await updateImg(e, "LongTu", "l图", gitLong, "gitLong")
    return true
}

async function updateImg(e, path, type, imgUrl, Folder) {
    if (fs.existsSync(`${FanSkyPath}${Folder}/${path}/`)) {
        e.reply(`[FanSky_Qs]正在更新[${type}]中，请耐心等待~`);
        let UpdateCmd = "git  checkout . && git  pull"
        exec(UpdateCmd, {
            cwd: `${FanSkyPath}${Folder}/${path}`
        }, function (error, stdout, stderr) {
            if (/Already up to date/.test(stdout) || stdout.includes("最新")) {
                e.reply(`目前${type}已经是最新了哦~`);
                return true;
            }
            let numRet = /(\d*) files changed,/.exec(stdout);
            if (numRet && numRet[1]) {
                e.reply(`报告主人，更新成功，此次更新了${numRet[1]}张${type}~`);
                return true;
            }
            if (error) {
                e.reply("更新失败！\nError code: " + error.code + "\n" + error.stack + "\n 请稍后重试。");
            } else {
                e.reply(`更新完成！您后续也可以通过 #${type}更新 命令来更新图像`);
            }
        });
    } else {
        e.reply(`[FanSky_Qs]正在首次载入[${type}]中，可能有点慢，请耐心等待~`);
        let CloneCmd = `git clone ${imgUrl} "${FanSkyPath}${Folder}/"`
        exec(CloneCmd, function (error, stdout, stderr) {
            if (error) {
                e.reply("安装失败！\nError code: " + error.code + "\n" + error.stack + "\n 请稍后重试。");
            } else {
                e.reply(`安装成功！您后续也可以通过 #${type}更新 命令来更新图像\n触发指令：${type}`);
            }
        });
    }
    return true
}