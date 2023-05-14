import YAML from 'yaml';
import fs from 'fs';
import {getQQ} from "../../models/getQQ.js";

const cwd = process.cwd().replace(/\\/g, "/") + `/config/config/other.yaml`;

const groupKeywords = ['群', 'Q群', 'QQ群'];

export async function PullBlack(e) {
    let Message = (e.msg || e.original_msg || e.raw_message) + '';
    let msg = ''
    if (await getQQ(e) !== null) {
        if (Message.includes("#拉黑")) {
            msg = "#拉黑" + await getQQ(e)
        } else {
            msg = "#解黑" + await getQQ(e)
        }
    } else {
        msg = Message
    }
    const match = /^#(拉黑|解黑|取消拉黑)(QQ|Q群|QQ群|群)?(\d+)/u.exec(msg);
    if (!match) {
        await e.reply("未识别到操作指令喵！");
        return true;
    }
    const [_, action, targetType, target] = match;
    if (!target) {
        await e.reply("未检测到要操作的对象喵！");
        return true;
    }
    const numTarget = Number(target);
    if (isNaN(numTarget)) {
        await e.reply(`${targetType || 'QQ号'}[${target}]不是合法的数字喵！`);
        return true;
    }
    const config = YAML.parse(fs.readFileSync(cwd, 'utf8'));
    let blackList;
    let whiteList = config.whiteGroup || [];
    if (groupKeywords.includes(targetType)) {
        blackList = config.blackGroup || [];
    } else {
        blackList = config.blackQQ || [];
    }
    if (action === '拉黑') {
        const whiteIndex = whiteList.indexOf(numTarget);
        if (whiteIndex !== -1) {
            whiteList.splice(whiteIndex, 1);
            config.whiteGroup = whiteList;
            fs.writeFileSync(cwd, YAML.stringify(config));
            await e.reply(`已将Q群[${numTarget}]从白名单移除喵！`);
        }
        if (blackList.includes(numTarget)) {
            await e.reply(`${targetType || 'QQ号'}[${numTarget}]已经在黑名单中了喵！`);
            return true;
        }
        blackList.push(numTarget);
        if (groupKeywords.includes(targetType)) {
            config.blackGroup = blackList;
            await e.reply(`已将群组[${numTarget}]拉黑喵！以后不再响应该群组的任何指令喵！`);
        } else {
            config.blackQQ = blackList;
            await e.reply(`已将QQ号[${numTarget}]拉黑喵！以后不再响应该QQ号的任何指令喵！`);
        }
    } else {
        const index = blackList.indexOf(numTarget);
        if (index === -1) {
            await e.reply(`${targetType || 'QQ号'}[${numTarget}]不在黑名单中喵！`);
            return true;
        }
        blackList.splice(index, 1);
        if (groupKeywords.includes(targetType)) {
            config.blackGroup = blackList;
            await e.reply(`已将群组[${numTarget}]解黑喵！`);
        } else {
            config.blackQQ = blackList;
            await e.reply(`已将QQ号[${numTarget}]解黑喵！`);
        }
    }
    fs.writeFileSync(cwd, YAML.stringify(config));
    return true;
}

export async function AddWhiteGroup(e) {
    const msg = (e.msg || e.original_msg || e.raw_message) + '';
    const match = /^#(加白|加白群|添加白名单|添加白名单群)(Q群|QQ群|群)?(\d+)/u.exec(msg)
    if (!match) {
        await e.reply("未识别到操作指令喵！");
        return false;
    }
    const [_, action, targetType, target] = match;
    if (!target) {
        await e.reply("未检测到要加白的群喵！");
        return false;
    }
    const numTarget = Number(target);
    if (isNaN(numTarget)) {
        await e.reply(`${targetType || 'Q群号'}[${target}]不是合法的数字喵！`);
        return false;
    }
    const config = YAML.parse(fs.readFileSync(cwd, 'utf8'));
    let whiteList = config.whiteGroup || [];
    if (whiteList.includes(numTarget)) {
        await e.reply(`${targetType || 'Q群号'}[${numTarget}]已经在白名单中了喵！`);
        return false;
    }
    whiteList.push(numTarget);
    config.whiteGroup = whiteList;
    fs.writeFileSync(cwd, YAML.stringify(config));
    await e.reply(`已将群组[${numTarget}]加白喵！`);
    return true;
}

async function getNumberQQ(Msg) {
    const regex = /^#(拉黑|解黑|取消拉黑)(\d+)/u;
    const matches = regex.exec(Msg + '');
    if (matches) {
        return matches[2]
    }
    return null
}