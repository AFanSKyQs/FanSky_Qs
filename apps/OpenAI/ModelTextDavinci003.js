/* eslint-disable camelcase */
import common from '../../../../lib/common/common.js'
import axios from 'axios'
import getCfg from '../../models/getCfg.js'
import puppeteer from '../../../../lib/puppeteer/puppeteer.js'

let userCount = [0]
let CountMember = 9
let adminCount = 99
let yunPath = process.cwd()
let Axios = []
let OpenAIList = ['']
let MoudelStatus = []

export async function ModelTextDavinci003(e, OpenAI_Key, Model, Json, GetResult) {
    let msg = e.msg
    Bot.logger.info('处理插件：FanSky_Qs-OpenAI模型2:' + `\n群：${e.group_id}\n` + 'QQ:' + `${e.user_id}\n` + `消息：${msg}`)
    MoudelStatus[e.user_id] = true
    if (!Axios[e.user_id]) {
        Axios[e.user_id] = ['']
        OpenAIList[0] = OpenAIList[0] + `【${OpenAIList.length}】:${e.user_id}\n`
    }
    if (!userCount[e.user_id] || userCount[e.user_id][0] === 0) {
        userCount[e.user_id] = 0
        if (e.isMaster) {
            userCount[e.user_id] = adminCount
        } else {
            userCount[e.user_id] = CountMember
        }
        Axios[e.user_id] = ['']
    }
    Axios[e.user_id][0] = Axios[e.user_id][0] + `\nHuman:${msg}`
    console.log('Axios:' + Axios[e.user_id][0])
    const OpenAI = {
        model: `${Model}`,
        prompt: Axios[e.user_id][0],
        max_tokens: 2048,
        temperature: 0.3,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0.6,
        stop: [' Human:', ' AI:']
    }
    try {
        userCount[e.user_id] = userCount[e.user_id] - 1
        await MsgOpenAIModel2(e, OpenAI, GetResult, OpenAI_Key, Json)
    } catch (err) {
        delete MoudelStatus[e.user_id]
        e.reply('AI出错了！请联系开发人员（3141865879）\n' + err, true)
        await common.sleep(3000)
        await Bot.pickFriend(3141865879).sendMsg(`错误信息：${err}\n群组：${e.group_id}\n` + '用户:' + `${e.user_id}`)
        console.log(err)
        return true
    }
}

async function MsgOpenAIModel2(e, PostDate, GetResult, OpenAI_KEY, Json) {
    try {
        axios({
            method: 'post',
            url: 'https://api.openai.com/v1/completions',
            headers: {
                'Content-Type': 'application/json',
                'Accept-Encoding': 'gzip,deflate',
                'Content-Length': 1024,
                'Transfer-Encoding': 'chunked',
                Authorization: 'Bearer ' + OpenAI_KEY
            },
            data: JSON.stringify(PostDate),
            proxy: {
                protocol: 'http',
                host: '127.0.0.1',
                port: 7890
            }
        }).then(async function (response) {
            let ReciveMsg = response.data.choices[0].text
            let Axios_Temp = ReciveMsg
                .replace(/机器人：/, '').trim()
                .replace(/\n/, '').trim()
                .replace(/答：/, '').trim()
                .replace(/AI:/, '').trim()
                .replace(/Bot:/, '').trim()
                .replace(/robot:/, '').trim()
                .replace(/Robot:/, '').trim()
                .replace(/Computer:/, '').trim()
                .replace(/computer:/, '').trim()
            if (Axios_Temp.startsWith('，') || Axios_Temp.startsWith('？') || Axios_Temp.startsWith('?') || Axios_Temp.startsWith(',') || Axios_Temp.startsWith('。')) {
                Axios_Temp = Axios_Temp.slice(1)
            }
            if (Axios_Temp.startsWith('吗？') || Axios_Temp.startsWith('吗?')) {
                Axios_Temp = Axios_Temp.slice(2)
            }
            Axios[e.user_id][0] = Axios[e.user_id][0] + '\nAI:' + Axios_Temp
            if (!Axios_Temp.startsWith('【')) {
                Axios_Temp = `【距对话重置：${userCount[e.user_id]}】\n【消耗8魔晶 | 剩余：${GetResult}】` + Axios_Temp
            }
            if (userCount[e.user_id] === 0) {
                if (e.isMaster) {
                    userCount[e.user_id] = adminCount
                } else {
                    userCount[e.user_id] = CountMember
                }
                Axios[e.user_id] = ['']
                e.reply('对话已重置，将开始新的记忆。')
            }
            if (Json.ModelMode === 1) {
                Axios[e.user_id] = ['']
            }
            let TextToImg = (await getCfg(yunPath, 'OpenAI')).Text_img
            if (Axios_Temp.length > TextToImg) {
                await ScreenAndSend(e, Axios_Temp)
            } else {
                e.reply(Axios_Temp, true)
            }
            delete MoudelStatus[e.user_id]
        }).catch(function (error) {
            delete MoudelStatus[e.user_id]
            console.log(error)
            Axios[e.user_id] = ['']
            e.reply('已重置对话、发送error', true)

            try {
                axios({
                    method: 'post',
                    url: 'https://api.openai.com/v1/completions',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept-Encoding': 'gzip,deflate',
                        'Content-Length': 1024,
                        'Transfer-Encoding': 'chunked',
                        Authorization: 'Bearer ' + OpenAI_KEY
                    },
                    data: JSON.stringify(PostDate),
                }).then(async function (response) {
                    let ReciveMsg = response.data.choices[0].text
                    let Axios_Temp = ReciveMsg
                        .replace(/机器人：/, '').trim()
                        .replace(/\n/, '').trim()
                        .replace(/答：/, '').trim()
                        .replace(/AI:/, '').trim()
                        .replace(/Bot:/, '').trim()
                        .replace(/robot:/, '').trim()
                        .replace(/Robot:/, '').trim()
                        .replace(/Computer:/, '').trim()
                        .replace(/computer:/, '').trim()
                    if (Axios_Temp.startsWith('，') || Axios_Temp.startsWith('？') || Axios_Temp.startsWith('?') || Axios_Temp.startsWith(',') || Axios_Temp.startsWith('。')) {
                        Axios_Temp = Axios_Temp.slice(1)
                    }
                    if (Axios_Temp.startsWith('吗？') || Axios_Temp.startsWith('吗?')) {
                        Axios_Temp = Axios_Temp.slice(2)
                    }
                    Axios[e.user_id][0] = Axios[e.user_id][0] + '\nAI:' + Axios_Temp
                    if (!Axios_Temp.startsWith('【')) {
                        Axios_Temp = `【距对话重置：${userCount[e.user_id]}】\n【消耗8魔晶 | 剩余：${GetResult}】` + Axios_Temp
                    }
                    if (userCount[e.user_id] === 0) {
                        if (e.isMaster) {
                            userCount[e.user_id] = adminCount
                        } else {
                            userCount[e.user_id] = CountMember
                        }
                        Axios[e.user_id] = ['']
                        e.reply('对话已重置，将开始新的记忆。')
                    }
                    if (Json.ModelMode === 1) {
                        Axios[e.user_id] = ['']
                    }
                    let TextToImg = (await getCfg(yunPath, 'OpenAI')).Text_img
                    if (Axios_Temp.length > TextToImg) {
                        await ScreenAndSend(e, Axios_Temp)
                    } else {
                        e.reply(Axios_Temp, true)
                    }
                    delete MoudelStatus[e.user_id]
                    return true
                }).catch(function (error) {
                    delete MoudelStatus[e.user_id]
                    console.log(error)
                    Axios[e.user_id] = ['']
                    e.reply('已重置对话、发送error', true)
                    return true
                })
            } catch (err) {
                console.log(err)
            }
        })
    } catch (err) {
        delete MoudelStatus[e.user_id]
        e.reply('AI出错了！请联系开发人员（3141865879）\n' + err, true)
        await common.sleep(3000)
        await Bot.pickFriend(3141865879).sendMsg(`错误信息：${err}\n群组：${e.group_id}\n` + '用户:' + `${e.user_id}`)
        console.log(err)
        return true
    }
    return true
}

async function ScreenAndSend(e, message) {
    if (message) {
        console.log('OpenAI:' + message)
        let OpenAI = message.replace(/ /g, '&nbsp;').replace(/\n/g, '<br>')
        let img = await puppeteer.screenshot('OpenAI', {tplFile: cssPath, htmlDir: htmlPath, OpenAI}) // 截图
        e.reply(img)
        return true
    } else {
        e.reply('消息为空，已退出')
        return true
    }
}

export async function DelModelText003() {
    OpenAIList = ['']
    userCount = [0]
    MoudelStatus = []
    Axios = []
}

export async function ResetModelText003(e) {
    try {
        if (MoudelStatus[e.user_id]) {
            delete MoudelStatus[e.user_id]
        }
    } catch (err) {
        console.log(err)
    }
}