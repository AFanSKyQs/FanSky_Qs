/* eslint-disable camelcase */
import common from '../../../../lib/common/common.js'
import axios from 'axios'
import fs from 'fs'
import {getOpenAIConfig} from "../../models/getCfg.js";

let Moudel1List = []
let MoudelStatus = []
let Moudel1Num = []

export async function ModelGPT3Turbo(e, OpenAI_Key, Json, GetResult) {
    let msg = e.original_msg || e.msg
    Bot.logger.info('处理插件：FanSky_Qs-OpenAI模型1:' + `\n群：${e.group_id}\n` + 'QQ:' + `${e.user_id}\n` + `消息：${msg}`)
    let Persona = "你是喵喵喵喵~"
    let Redis = JSON.parse(await redis.get(`FanSky:OpenAI:Person:Default`))
    if (Redis) {
        Persona = Redis.Person
    } else {
        e.reply("没有检测到默认人设，请重启或联系开发人员检查问题")
        return false
    }
    if (await redis.get(`FanSky:OpenAI:Person:${e.user_id}`)) {
        let singlePersona = JSON.parse(await redis.get(`FanSky:OpenAI:Person:${e.user_id}`))
        Persona = singlePersona.Person
    }
    MoudelStatus[e.user_id] = true
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
        // 先对比一下本次预设的人设是否与上次一致，如果不一致则重置重新开始
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
            data: JSON.stringify(Moudel1List[e.user_id]),
            proxy: {
                protocol: 'http',
                host: '127.0.0.1',
                port: 7890
            },
        }).then(async function (response) {
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
                    delete Moudel1List[e.user_id]
                    delete MoudelStatus[e.user_id]
                    Bot.logger.info(error)
                    let OpenAIConfig = await getOpenAIConfig()
                    if (OpenAIConfig.error) {
                        e.reply("没有找到配置文件")
                        return false
                    }
                    let OpenAIQuota = await axios.get(`https://v1.apigpt.cn/key/?key=${OpenAIConfig.OpenAI_Key.trim()}`)
                    let ExpiresTime = new Date(OpenAIQuota.data.expires_at * 1000).toLocaleString()
                    e.reply(`可能[Clash设置未生效][机场不可用(如一元机场)]喵\nKey:${OpenAIQuota.data.msg}\n可用：${OpenAIQuota.data.total_available}\n到期：${ExpiresTime}\n其余信息请控制查看~`)
                })
            } catch (err) {
                console.log(err)
                e.reply("访问没有成功")
            }
        })
    } catch (err) {
        e.reply('运行有问题~,请联系开发人员(3141865879)')
        console.log(err)
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
    delete MoudelStatus[e.user_id]
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
    MoudelStatus = []
    Moudel1List = []
}

export async function ResetGPT3TurboList(e) {
    try {
        if (MoudelStatus[e.user_id]) {
            delete MoudelStatus[e.user_id]
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