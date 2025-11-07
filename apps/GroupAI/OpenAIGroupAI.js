import getCfg from "../../models/getCfg.js";
import {ModelGPT3Turbo} from "../OpenAI/ModelGPT3Turbo.js";

const keywords = new Set(['角色面板','开始获取', '当前面板服务', '开始获取', '#绑定', '退群了', '绑定成功', '来切换uid', '请重新绑定', '米游社查询', '可能会需要一定时间', '更新面板', '角色展柜', '当前uid', '当前绑定']);
let yunPath = process.cwd().replace(/\\/g, "/")
export async function GroupAI(e) {
    const GroupOn = await getCfg(yunPath, 'config')
    if (!e.isPrivate) {
        let GroupIndex = GroupOn.OpenAIGroup.indexOf((e.group_id).toString())
        console.log(GroupIndex)
        if (GroupIndex !== -1) {
        } else if (GroupOn.OpenAIGroup.length === 0) {
        } else {
            return false
        }
    }
    if ((e.msg + "").startsWith('#dd')) {
        return true
    }
    if ((e.msg + "").startsWith('#')) {
        return false
    }
    if ((e.msg + "").startsWith('*')) {
        return false
    }
    let GroupId= e.group_id
    if(!GroupId){
        return false
    }
    if (await redis.get(`FanSky:OpenAI:Status:${GroupId}`)) {
        return false
    }
    let ResMsg = "" //请求Msg
    if (e.atBot || e.atme) {
        ResMsg = await ReturnResMsg(e)
        if (!ResMsg || ResMsg === false) return false
    } else {
        let Random = Math.random()
        if (Random > 0.3) return false
        ResMsg = await ReturnResMsg(e)
        if (!ResMsg || ResMsg === false) return false
    }
    const Json = await getCfg(yunPath, 'config')
    const OpenAI_Key = Json.OpenAI_Key
    if (OpenAI_Key === '这里填入你的OpenAI密钥即可' || !OpenAI_Key || OpenAI_Key === '') {
        return false
    }

    logger.info(ResMsg);
    await redis.set(`FanSky:OpenAI:Status:${GroupId}`, JSON.stringify({Status: 1}));
    await redis.expire(`FanSky:OpenAI:Status:${GroupId}`, 20); //设置过期时间,20s
    await ModelGPT3Turbo(e, OpenAI_Key, Json, "不限", ResMsg, true)
    return true
}

async function ReturnResMsg(e) {
    let ResMsg = ""
    logger.info(logger.magenta(`[FanSky_Qs]群AI:${e.group_id}`));
    let BeginSeq = e.seq;
    let source = (await e.group.getChatHistory(BeginSeq, 1)).pop()
    if (source) {
        const MsgText = source.message.find(msg => msg.type === "text");
        if (!MsgText) return false
    }
    let BeginSeq2 = BeginSeq - 40
    for (let i = BeginSeq2; i <= BeginSeq; i++) {
        let source = (await e.group.getChatHistory(i, 1)).pop()
        if (source) {
            try {
                const MsgText = source.message.find(msg => msg.type === "text");
                const Msg_Bface = source.message.find(msg => msg.type === "bface");
                const Msg_face = source.message.find(msg => msg.type === "face");
                if (MsgText && MsgText.text) {
                    if (MsgText.text.length > 90) {
                        continue
                    }
                    if (MsgText.text.startsWith('#') || MsgText.text.startsWith('*')) {
                        continue
                    }
                    const atMsg = source.message.find(msg => msg.type === "at");
                    const prefix = atMsg ? `@${atMsg.qq} ` : '';

                    let containsKeyword = false;
                    for (const keyword of keywords) {
                        if (MsgText.text.includes(keyword)) {
                            containsKeyword = true;
                            break;
                        }
                    }
                    if (containsKeyword) {
                        continue
                    }
                    // [emoji] [/emoji]
                    ResMsg += `${source.user_id}:${prefix}${MsgText.text}\n`;
                }
                else if (Msg_Bface && Msg_Bface.text) {
                    if (Msg_Bface.text.includes("请使用最新版")) {
                        continue
                    }
                    ResMsg += source.user_id + ":[表情]" + Msg_Bface.text + "\n"
                } else if (Msg_face && Msg_face.text) {
                    if (Msg_face.text.includes("请使用最新版")) {
                        continue
                    }
                    ResMsg += source.user_id + ":[表情]" + Msg_face.text + "\n"
                }
            } catch (err) {
                logger.error(err)
            }
        }
    }
    ResMsg += `${Bot.uin}` + ":"
    return ResMsg
}
