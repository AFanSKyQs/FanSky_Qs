/* eslint-disable camelcase */
import common from '../../../../lib/common/common.js'
import axios from 'axios'
import fs from 'fs'

let Moudel1List = []
let MoudelStatus = []
let Moudel1Num = []
export async function ModelGPT3Turbo(e, OpenAI_Key, Json, GetResult) {
    let msg = e.msg
    Bot.logger.info('处理插件：FanSky_Qs-OpenAI模型1:' + `\n群：${e.group_id}\n` + 'QQ:' + `${e.user_id}\n` + `消息：${msg}`)
    let Persona = Json.Persona
    if (!e.isMaster) {
        let singleModelFolder = `${process.cwd()}/resources/FanSky`
        let singleModel = `${process.cwd()}/resources/FanSky/singleModel.json`
        if (!fs.existsSync(singleModelFolder)) {
            fs.mkdirSync(singleModelFolder);
            console.log('>>>已创建FanSky文件夹')
        }
        if (!fs.existsSync(singleModel)) {
            fs.writeFileSync(singleModel, '{}');
            console.log('>>>已创建singleModel.json文件')
        }
        let singleModelConfig = JSON.parse(fs.readFileSync(singleModel))
        try {
            if (singleModelConfig[e.user_id].Persona) {
                Persona = singleModelConfig[e.user_id].Persona
            }
        } catch (err) {
            Persona = Json.Persona
        }
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
            console.log(response.data.choices[0])
            let result = response.data.choices[0].message.content
            let SendResult, MsgList
            if (GetResult === '不限') {
                if (response.data.choices[0].message.content.length > 150) {
                    let NowTime = (new Date(Date.now())).toLocaleString()
                    MsgList = [`${result}`, `${NowTime}`]
                    SendResult = await common.makeForwardMsg(e, MsgList, `FanSky_Qs-OpenAI | ${NowTime}`)
                    await e.reply(SendResult)
                } else {
                    SendResult = `距重置：${10 - Moudel1Num[e.user_id]} | ${response.data.choices[0].message.content.length}字\n` + result
                    e.reply(SendResult, true)
                }
            } else {
                SendResult = `魔晶：${GetResult} | 重置：${10 - Moudel1Num[e.user_id]} | ${response.data.choices[0].message.content.length}字\n` + result
                e.reply(SendResult, true)
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
        }).catch(async function () {
            try {
                await axios({
                    method: 'post', url: 'https://api.openai.com/v1/chat/completions', headers: {
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + OpenAI_Key
                    }, data: JSON.stringify(Moudel1List[e.user_id])
                }).then(async (response) => {
                    console.log(response.data.choices[0])
                    let result = response.data.choices[0].message.content
                    let SendResult, MsgList
                    if (GetResult === '不限') {
                        if (response.data.choices[0].message.content.length > 150) {
                            let NowTime = (new Date(Date.now())).toLocaleString()
                            MsgList = [`${result}`, `${NowTime}`]
                            SendResult = await common.makeForwardMsg(e, MsgList, `FanSky_Qs-OpenAI | ${NowTime}`)
                            await e.reply(SendResult)
                        } else {
                            SendResult = `距重置：${10 - Moudel1Num[e.user_id]} | ${response.data.choices[0].message.content.length}字\n` + result
                            e.reply(SendResult, true)
                        }
                    } else {
                        SendResult = `魔晶：${GetResult} | 重置：${10 - Moudel1Num[e.user_id]} | ${response.data.choices[0].message.content.length}字\n` + result
                        e.reply(SendResult, true)
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
                }).catch(async function (error) {
                    delete Moudel1List[e.user_id]
                    delete MoudelStatus[e.user_id]
                    Bot.logger.info(error)
                    e.reply('[Clash设置未生效]或[机场不可用(如:一元)]喵\n请查看控制台错误信息~')
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