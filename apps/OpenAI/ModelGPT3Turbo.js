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

export async function ModelGPT3Turbo(e, OpenAI_Key, Json, GetResult) {
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
                await e.group.sendMsg([await e.group.makeForwardMsg(SendMsg)])
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
                await e.group.sendMsg([await e.group.makeForwardMsg(SendMsg)])
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