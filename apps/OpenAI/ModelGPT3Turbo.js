/* eslint-disable camelcase */
import HttpsProxyAgent from 'https-proxy-agent'
import common from '../../../../lib/common/common.js'
import axios from 'axios'
import {segment} from 'oicq'
import {getOpenAIConfig} from "../../models/getCfg.js";
import * as url from "url";
import fetch from 'node-fetch'
import {l} from "./OpenAIQuota.js";

let Moudel1List = []
let Moudel1Num = []

async function SendAIGroup(e, ResultMsg) {
    let result = ResultMsg.data.choices[0].message.content
    let BotNickName = Bot.uin + ":"
    let BotNickName2 = Bot.uin + "："
    result = result.replace(/曙光:|我:|我：|曙光：/g, "")
    result = result.replace("[emoji]", "")
    result = result.replace("[/emoji]", "")
    result = result.replace(BotNickName, "")
    result = result.replace(BotNickName2, "")

    function formatMsg(msg) {
        const qqRegex = /@\d+\b/g;
        const qqs = msg.match(qqRegex);
        let formattedMsg = msg;
        let ReturnMsg = [];
        if (qqs) {
            let lastIndex = 0;
            for (const qq of qqs) {
                const index = formattedMsg.indexOf(qq);
                let TmpQQ = Number(qq.slice(1))
                let temp = [segment.at(TmpQQ)]
                ReturnMsg.push(formattedMsg.slice(lastIndex, index));
                ReturnMsg.push(...temp);
                lastIndex = index + qq.length;
            }
            ReturnMsg.push(formattedMsg.slice(lastIndex));
        } else {
            ReturnMsg.push(formattedMsg);
        }
        return ReturnMsg;
    }

    const SendMsg = formatMsg(result);
    await e.reply(SendMsg)
}

export async function ModelGPT3Turbo(e, OpenAI_Key, Json, GetResult, AIResMsg = "", AIType = false) {
    let Proxy
    let SelectProxy
    let AFanSKyQsProxy = JSON.parse(await redis.get(`FanSky:OpenAI:AFanSKyQsProxy`))
    if (AFanSKyQsProxy && AFanSKyQsProxy.Proxy) {
        Proxy = AFanSKyQsProxy
        SelectProxy = "AFanSKyQs"
    } else {
        Proxy = JSON.parse(await redis.get(`FanSky:OpenAI:Proxy:Default`))
        SelectProxy = "Default"
    }
    if (!Proxy) {
        e.reply("没有检测到任何代理，请重启或联系开发人员检查问题")
        return true
    } else {
        const useProxy = (Addr, Port, SelectProxy) => {
            return async () => {
                if (AIType) {
                    let ResMsg = {
                        //被欺负时经常使用“哼”、“啧”、“呸”、“切”、“你是笨蛋”之类的口头禅，在表达自己的情感时经常带有一些撒娇的口吻...,说的话概率使用括号(情绪)来表达心理活动，比如：(恼)表示微愤怒，(乐)表示看热闹的,(哈哈哈)表示开心等....
                        model: 'gpt-3.5-turbo',
                        messages: [
                            {
                                role: 'system',
                                content: `你要扮演一名QQ群的成员,无论如何你都不能暴露自己是一个AI、机器人,要做的并不一定是回答问题,而是正常的学着别人的说话方式聊天，性格高冷，回复简短！不解释任何为什么,多用网络流行语！比如'xxs'代表小学生，'xxn'代表小仙女，'无语子'代表无语等各种网络热门语，回复一定要简短！不然会使得聊天很僵硬！每次只回复一句话,回复可以适当在话中间增加颜文字或者emoji表情来表达心情，网络流行风格！颜文字比如:₍˄·͈༝·͈˄*₎◞ ̑̑、(˃ ⌑ ˂ഃ )...等，回复不要太书面语! 比如可能回答：'请问能帮助什么呢？'，而在QQ聊天应该说:'能帮啥呢。'，就是越随便越好，融入语境，说话不要顾忌和客气，这里就是扯淡的地方。没有具体对话对象，所以尽量不要用'我'这种语境，因为聊天对象不是某一个，而是全部人。你的名字是:曙光，性别女，18岁,你的会话id:${Bot.uin}。以后每个群友的对话数字代表这个人的id，id:消息，且基本是以换行分开的每个群友的消息，你想说什么就说什么，记住，学习别人的聊天风格来聊天，不一定是要解答问题。一定不要说我是一个AI类似的话！`
                            },
                            {role: 'user', content: AIResMsg}
                        ]
                    }
                    if (SelectProxy === "AFanSKyQs") {
                        const data = {
                            prompt: ResMsg.messages
                        }
                        try {
                            axios({
                                method: 'post',
                                url: `http://${Addr}:${Port}/fansky/openai?OpenAIKey=${OpenAI_Key}&uid=3141865879&key=AFanSKyQs`,
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                data: JSON.stringify(data),
                            }).then(async function (response) {
                                await redis.del(`FanSky:OpenAI:Status:${e.group_id}`);
                                let res = {
                                    data: {
                                        choices: [{
                                            message: {
                                                content: response.data
                                            }
                                        }]
                                    }
                                }
                                await SendAIGroup(e, res)
                            }).catch(async function (error) {
                                await redis.del(`FanSky:OpenAI:Status:${e.group_id}`);
                            })
                        } catch (err) {
                            logger.info(err)
                        }
                    } else if (SelectProxy === "Default") {
                        const OPENAI_API_KEY = OpenAI_Key.trim();
                        const url = 'https://api.openai.com/v1/chat/completions';
                        const headers = {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${OPENAI_API_KEY}`
                        };
                        const data = JSON.stringify(ResMsg);
                        const param = {
                            method: 'POST',
                            headers,
                            agent: await getAgent(`http://${Addr}:${Port}`),
                            body: data,
                            timeout: 20000
                        };
                        let response = {};
                        try {
                            response = await fetch(url, param);
                        } catch (error) {
                            logger.info(error)
                            return false
                        }
                        await redis.del(`FanSky:OpenAI:Status:${e.group_id}`);
                        if (!response.ok) {
                            logger.info(response)
                            return false
                        }
                        const res = await response.json();
                        if (!res) {
                            return false
                        }
                        await redis.del(`FanSky:OpenAI:Status:${e.group_id}`);
                        await SendAIGroup(e, {data: res})
                    }
                    return true
                }
                let msg = e.original_msg || e.msg
                if ((msg + "").startsWith('#dd')) {
                    msg = msg.slice(3);
                }
                msg = msg.trim()
                Bot.logger.info('处理插件：FanSky_Qs-OpenAI模型1:' + `\n群：${e.group_id}\n` + 'QQ:' + `${e.user_id}\n` + `消息：${msg}`)
                let Persona = "你是一个小助手~"
                if (await redis.get(`FanSky:OpenAI:Person:${e.user_id}`)) {
                    Persona = (JSON.parse(await redis.get(`FanSky:OpenAI:Person:${e.user_id}`))).Person
                } else if (await redis.get(`FanSky:OpenAI:Person:MasterPerson`)) {
                    Persona = (JSON.parse(await redis.get(`FanSky:OpenAI:Person:MasterPerson`))).Person
                } else if (await redis.get(`FanSky:OpenAI:Person:Default`)) {
                    Persona = (JSON.parse(await redis.get(`FanSky:OpenAI:Person:Default`))).Person
                } else {
                    e.reply("没有检测到任何人设，请重启或联系开发人员检查问题")
                    return false
                }
                await redis.set(`FanSky:OpenAI:Status:${e.user_id}`, JSON.stringify({Status: 1}))
                await redis.expire(`FanSky:OpenAI:Status:${e.user_id}`, 20); //设置过期时间,20s
                let DataList = {
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {role: 'system', content: Persona}
                    ]
                }
                let OpenStatus = JSON.parse(await redis.get(`FanSky:FunctionOFF`));
                if (OpenStatus.OpenAI4 === 1) {
                    DataList = {
                        model: 'gpt-4',
                        messages: [
                            {role: 'system', content: Persona}
                        ]
                    }
                }

                if (!Moudel1List[e.user_id]) {
                    DataList.messages.push({role: 'user', content: msg})
                    Moudel1List[e.user_id] = DataList
                    Moudel1Num[e.user_id] = 1
                } else {
                    /** 先对比一下本次预设的人设是否与上次一致，如果不一致则重置重新开始*/
                    if (Moudel1List[e.user_id].messages[0].content !== Persona) {
                        e.reply('AI检测到人设已经改变，已重置记忆，生成中...', true, {recallMsg: 10})
                        DataList.messages.push({role: 'user', content: msg})
                        Moudel1List[e.user_id] = DataList
                        Moudel1Num[e.user_id] = 1
                    } else {
                        Moudel1List[e.user_id].messages.push({role: 'user', content: msg})
                        Moudel1Num[e.user_id]++
                    }
                }
                logger.info(Moudel1List[e.user_id])
                if (SelectProxy === "AFanSKyQs") {
                    const data = {
                        prompt: (Moudel1List[e.user_id]).messages
                    }
                    try {
                        axios({
                            method: 'post',
                            url: `http://${Addr}:${Port}/fansky/openai?OpenAIKey=${OpenAI_Key}&uid=3141865879&key=AFanSKyQs`,
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            data: JSON.stringify(data),
                        }).then(async function (response) {
                            await redis.del(`FanSky:OpenAI:Status:${e.user_id}`);
                            let res = {
                                data: {
                                    choices: [{
                                        message: {
                                            content: response.data
                                        }
                                    }]
                                }
                            }
                            await SendResMsg(e, res, Json, GetResult)
                        }).catch(async function (error) {
                            let SendErr = error.code
                            if (SendErr === -70) {
                                await e.reply("\n你跟我说了什么ww！我的消息被风控啦啊a！", false, {
                                    at: true,
                                    recallMsg: 15
                                })
                            } else {
                                delete Moudel1List[e.user_id]
                                delete Moudel1Num[e.user_id]
                                await e.reply("\n[fGet返回]返回数据异常，已重置记忆", false, {at: true, recallMsg: 10})
                            }
                            logger.info(error)
                            await redis.del(`FanSky:OpenAI:Status:${e.user_id}`);
                        })
                    } catch (err) {
                        logger.info(err)
                        delete Moudel1List[e.user_id]
                        delete Moudel1Num[e.user_id]
                        await redis.del(`FanSky:OpenAI:Status:${e.user_id}`);
                        await e.reply("\n[发起fGet]发起请求异常，已重置记忆", false, {at: true, recallMsg: 10})
                    }
                } else if (SelectProxy === "Default") {
                    const OPENAI_API_KEY = OpenAI_Key.trim();
                    const url = 'https://api.openai.com/v1/chat/completions';
                    const headers = {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${OPENAI_API_KEY}`
                    };
                    const data = JSON.stringify(Moudel1List[e.user_id]);
                    const param = {
                        method: 'POST',
                        headers,
                        agent: await getAgent(`http://${Addr}:${Port}`),
                        body: data,
                        timeout: 20000
                    };
                    let response = {};
                    try {
                        response = await fetch(url, param);
                    } catch (error) {
                        await e.reply("\n[Fetch]报错惹，可能没有设置代理~", false, {at: true, recallMsg: 10})
                        await redis.del(`FanSky:OpenAI:Status:${e.user_id}`);
                        delete Moudel1List[e.user_id]
                        delete Moudel1Num[e.user_id]
                        logger.info(error)
                        return false
                    }
                    await redis.del(`FanSky:OpenAI:Status:${e.user_id}`);
                    if (!response.ok) {
                        await e.reply("\n[Response]接口请求异常~\n请检查代理设置", false, {at: true, recallMsg: 10})
                        delete Moudel1List[e.user_id]
                        delete Moudel1Num[e.user_id]
                        logger.info(response)
                        return false
                    }
                    const res = await response.json();
                    if (!res) {
                        await e.reply("[返回数据]接口数据为空~", true, {recallMsg: 10})
                        delete Moudel1List[e.user_id]
                        delete Moudel1Num[e.user_id]
                        return false
                    }
                    await redis.del(`FanSky:OpenAI:Status:${e.user_id}`);
                    await SendResMsg(e, {data: res}, Json, GetResult)
                }
            }
        }
        const proxyString = Proxy.Proxy
        const proxyUrl = url.parse(`http://${proxyString}`);
        const proxyAddress = proxyUrl.hostname;
        const proxyPort = proxyUrl.port;
        const proxyFunction = await useProxy(proxyAddress, proxyPort, SelectProxy);
        await proxyFunction();
    }
}

async function getAgent(Proxy) {
    let proxyAddress = Proxy;
    if (!proxyAddress) return null;
    if (proxyAddress === 'http://0.0.0.0:0') return null;
    return new HttpsProxyAgent(proxyAddress);
}

async function QQMsg(MsgList, e) {
    let NickName = e.sender.card || e.sender.nickname || e.user_id
    let acgList = []
    let bot = {nickname: "回复To: " + NickName, user_id: Bot.uin}
    acgList.push(
        {
            message: MsgList,
            ...bot,
        },
    )
    return acgList
}
// async function MakeForwardMsg(e, MsgList) {
//     let Msg = await e.group.makeForwardMsg(MsgList)
//     return Msg
// }
async function SendResMsg(e, response, Json, GetResult) {
    logger.info(response.data.choices[0])
    let result = response.data.choices[0].message.content
    let SendResult, MsgList
    if (GetResult === '不限') {
        if (response.data.choices[0].message.content.length > Json.Text_img) {
            // MsgList = [`${result}`, `${NowTime}\n魔晶：${GetResult}\n重置：${10 - Moudel1Num[e.user_id]}\n${response.data.choices[0].message.content.length}字`]
            MsgList = [`${result}`]
            let SendMsg = await QQMsg(MsgList, e)
            if (e.isGroup) {
                let ForwardMsg = await e.group.makeForwardMsg(SendMsg)
                ForwardMsg.data=ForwardMsg.data
                        .replace('<?xml version="1.0" encoding="utf-8"?>', '<?xml version="1.0" encoding="utf-8" ?>')
                        .replace(/\n/g, '')
                        .replace(/<title color="#777777" size="26">(.+?)<\/title>/g, '___')
                        .replace(/___+/, '<title color="#777777" size="26">OpenAI回复消息~</title>')
                await e.group.sendMsg(ForwardMsg)
                await e.member.poke()
            } else {
                await e.reply([await e.friend.makeForwardMsg(SendMsg)])
            }
        } else {
            e.reply("\n" + result, false, {at: true})
        }
    } else {
        if (response.data.choices[0].message.content.length > Json.Text_img) {
            // MsgList = [`${result}`, `${NowTime}\n魔晶：${GetResult}\n重置：${10 - Moudel1Num[e.user_id]}\n${response.data.choices[0].message.content.length}字`]
            MsgList = [`${result}`]
            let SendMsg = await QQMsg(MsgList, e)
            if (e.isGroup) {
                let ForwardMsg = await e.group.makeForwardMsg(SendMsg)
                ForwardMsg.data=ForwardMsg.data
                        .replace('<?xml version="1.0" encoding="utf-8"?>', '<?xml version="1.0" encoding="utf-8" ?>')
                        .replace(/\n/g, '')
                        .replace(/<title color="#777777" size="26">(.+?)<\/title>/g, '___')
                        .replace(/___+/, '<title color="#777777" size="26">OpenAI回复消息~</title>')
                await e.group.sendMsg(ForwardMsg)
                await e.member.poke()
            } else {
                await e.reply([await e.friend.makeForwardMsg(SendMsg)])
            }
        } else {
            // SendResult = `魔晶：${GetResult} | 重置：${10 - Moudel1Num[e.user_id]} | ${response.data.choices[0].message.content.length}字\n` + result
            e.reply("\n" + result, false, {at: true})
        }
    }
    Moudel1List[e.user_id].messages.push({role: 'assistant', content: result})
    await redis.del(`FanSky:OpenAI:Status:${e.user_id}`);
    if (Moudel1Num[e.user_id] >= 10 && !e.isMaster) {
        delete Moudel1List[e.user_id]
        delete Moudel1Num[e.user_id]
    }
    if (Json.ModelMode === 1) {
        delete Moudel1List[e.user_id]
        delete Moudel1Num[e.user_id]
    }
    return false
}

export async function DelGPT3TurboList() {
    Moudel1Num = []
    Moudel1List = []
}

export async function ResetGPT3TurboList(e) {
    try {
        if (await redis.get(`FanSky:OpenAI:Status:${e.user_id}`)) {
            await redis.del(`FanSky:OpenAI:Status:${e.user_id}`)
        }
        if (Moudel1List[e.user_id]) {
            delete Moudel1List[e.user_id]
        }
        if (Moudel1Num[e.user_id]) {
            delete Moudel1Num[e.user_id]
        }
    } catch (err) {
        logger.info(err)
    }
}


// let HttpsProxyAgent = ''
// async function getAgent(Proxy) {
//     let proxyAddress = Proxy
//     if (!proxyAddress) return null
//     if (proxyAddress === 'http://0.0.0.0:0') return null
//     if (HttpsProxyAgent === '') {
//         HttpsProxyAgent = await import('https-proxy-agent').catch((err) => {
//             logger.info(err)
//         })
//         HttpsProxyAgent = HttpsProxyAgent ? HttpsProxyAgent.default : undefined
//     }
//     if (HttpsProxyAgent) {
//         return new HttpsProxyAgent(proxyAddress)
//     }
//     return null
// }