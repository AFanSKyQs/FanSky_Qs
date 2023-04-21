/* eslint-disable camelcase */
import common from '../../../../lib/common/common.js'
import axios from 'axios'
import {getOpenAIConfig} from "../../models/getCfg.js";
import * as url from "url";
import {l} from "./OpenAIQuota.js";

let Moudel1List = []
let Moudel1Num = []

export async function ModelGPT3Turbo(e, OpenAI_Key, Json, GetResult) {
    let Proxy = JSON.parse(await redis.get(`FanSky:OpenAI:Proxy:Default`))
    if (!Proxy) {
        e.reply("没有检测到任何代理，请重启或联系开发人员检查问题")
        return true
    } else {
        const useProxy = (Addr, Port) => {
            return async () => {
                let msg = e.original_msg || e.msg
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
                await redis.set(`FanSky:OpenAI:Status:${e.user_id}`, JSON.stringify({Status:1}))
                let DataList = {
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {role: 'system', content: Persona}
                    ]
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
                console.log(Moudel1List[e.user_id])
                try {
                    axios({
                        method: 'post',
                        url: 'https://api.openai.com/v1/chat/completions',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: 'Bearer ' + OpenAI_Key
                        },
                        proxy: {
                            protocol: `http`,
                            host: `${Addr}`,
                            port: Port
                        },
                        data: JSON.stringify(Moudel1List[e.user_id]),
                    },).then(async function (response) {
                        await SendResMsg(e, response, Json, GetResult)
                    }).catch(async function () {
                        try {
                            await axios({
                                method: 'post', url: 'https://api.openai.com/v1/chat/completions', headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: 'Bearer ' + OpenAI_Key
                                }, data: JSON.stringify(Moudel1List[e.user_id])
                            }).then(async (response) => {
                                await SendResMsg(e, response, Json, GetResult)
                            }).catch(async function (error) {
                                await redis.del(`FanSky:OpenAI:Status:${e.user_id}`);
                                delete Moudel1List[e.user_id]
                                Bot.logger.info(error)
                                let OpenAIConfig = await getOpenAIConfig()
                                if (OpenAIConfig.error) {
                                    e.reply("[FanSky_Qs]OpenAI没有找到配置文件")
                                    return false
                                }
                                e.reply(`-[单纯请求超时]\n-[Clash设置未生效]\n-[机场不可用(如一元机场)]\n-[KEY不可用]\n\n请求失败，正在查询Bot的OpenAI_KEY状态~,请根据返回结果分析原因`, true)
                                await l(e, OpenAIConfig)
                                return true
                            })
                        } catch (err) {
                            console.log(err)
                            e.reply("请检查你的代理设置\n设置指令：#设置模型代理地址xxx\n\n格式(只是例子，实际根据你的代理来设置)ip+http端口：\n127.0.0.1:7890", true)
                        }
                    })
                } catch (err) {
                    e.reply('运行有问题~,请联系开发人员(3141865879)')
                    console.log(err)
                }
            }
        }

        const proxyString = Proxy.Proxy
        const proxyUrl = url.parse(`http://${proxyString}`);
        const proxyAddress = proxyUrl.hostname;
        const proxyPort = proxyUrl.port;
        const proxyFunction = await useProxy(proxyAddress, proxyPort);
        await proxyFunction();
    }
}

async function SendResMsg(e, response, Json, GetResult) {
    console.log(response.data.choices[0])
    let result = response.data.choices[0].message.content
    let SendResult, MsgList
    if (GetResult === '不限') {
        if (response.data.choices[0].message.content.length > Json.Text_img) {
            let NowTime = (new Date(Date.now())).toLocaleString()
            MsgList = [`${result}`, `${NowTime}\n魔晶：${GetResult}\n重置：${10 - Moudel1Num[e.user_id]}\n${response.data.choices[0].message.content.length}字`]
            let tmpMsg = result.substring(0, 15)
            SendResult = await common.makeForwardMsg(e, MsgList, `${NowTime} | ${tmpMsg}`)
            await e.reply(SendResult)
        } else {
            SendResult = `距重置：${10 - Moudel1Num[e.user_id]} | ${response.data.choices[0].message.content.length}字\n` + result
            e.reply(SendResult, true)
        }
    } else {
        if (response.data.choices[0].message.content.length > Json.Text_img) {
            let NowTime = (new Date(Date.now())).toLocaleString()
            MsgList = [`${result}`, `${NowTime}\n魔晶：${GetResult}\n重置：${10 - Moudel1Num[e.user_id]}\n${response.data.choices[0].message.content.length}字`]
            let tmpMsg = result.substring(0, 15)
            SendResult = await common.makeForwardMsg(e, MsgList, `${NowTime} | ${tmpMsg}`)
            await e.reply(SendResult)
        } else {
            SendResult = `魔晶：${GetResult} | 重置：${10 - Moudel1Num[e.user_id]} | ${response.data.choices[0].message.content.length}字\n` + result
            e.reply(SendResult, true)
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
        console.log(err)
    }
}