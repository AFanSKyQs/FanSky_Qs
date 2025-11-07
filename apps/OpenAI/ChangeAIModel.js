import fs from 'fs'
import getCfg, {getOpenAIConfig} from '../../models/getCfg.js'

let yunPath = process.cwd().replace(/\\/g, "/")
let OpenAIPath = `${yunPath}/plugins/FanSky_Qs/config/config.json`

export async function setAllPerson(e) {
    if (!e.isMaster) {
        e.reply("你不能设置全局人设噢喵~")
        return true
    }
    let msg = e.original_msg || e.msg
    if (msg && msg.includes("删除")) {
        await redis.del(`FanSky:OpenAI:Person:MasterPerson`)
        e.reply(`已删除全局人设~\n状态：用户个人 > 系统预设`)
        return true
    }
    const matchResult = msg.match(/#设置全局人设(.+)/)
    const person = matchResult ? matchResult[1] : null
    if (!person) {
        e.reply("设置失败，人设不能为空")
        return true
    } else if (person.length <= 6) {
        e.reply("人设太短啦，再考虑考虑~")
        return true
    }
    await redis.set(`FanSky:OpenAI:Person:MasterPerson`, JSON.stringify({
        Person: `${person}`,
        Time: `${new Date().getTime()}`,
        type: "MasterPerson"
    }))
    e.reply(`设置成功，全局人设为\n(当用户无人设时)：\n${person}`)
    return true
}

export async function OnOFF(e) {
    if (!e.isMaster) {
        e.reply("你不能关闭我喵~")
        return true
    }
    let path = `${process.cwd()}/plugins/FanSky_Qs/config/config.json`
    path = path.replace(/\\/g, '/')
    let OpenAIJson = JSON.parse(fs.readFileSync(path))
    if (!OpenAIJson.OnOff) {
        OpenAIJson.OnOff = "开启"
        await fs.writeFileSync(path, JSON.stringify(OpenAIJson))
    }
    if (e.msg.includes("打开") || e.msg.includes("开启") || e.msg.includes("启用")) {
        OpenAIJson.OnOff = "开启"
        await fs.writeFileSync(path, JSON.stringify(OpenAIJson))
    } else {
        OpenAIJson.OnOff = "关闭"
        await fs.writeFileSync(path, JSON.stringify(OpenAIJson))
    }
    e.reply(`OpenAI设置成功：${OpenAIJson.OnOff}`)
    return true
}

export async function OpenGroupAI(e) {
    if (!e.isMaster) {
        e.reply("你不能控制我在哪里聊天噢喵~")
        return true
    }
    // reg: /#(开启|打开|open|关闭|禁用|关机)群(模型|AI|OpenAI|ai|聊天)(\d+)/
    let GroupNum = e.msg.match(/#(开启|打开|open|关闭|禁用|关机)群(模型|AI|OpenAI|ai|聊天)(\d+)/)[3]
    let Msg = e.msg
    let OpenAIConfig = await getOpenAIConfig()
    if (Msg.includes("开启") || Msg.includes("打开") || Msg.includes("open")) {
        OpenAIConfig.OpenAIGroup.push(GroupNum)
        await fs.writeFileSync(OpenAIPath, JSON.stringify(OpenAIConfig))
        e.reply(`已开启群[${GroupNum}]的OpenAI功能喵~`)
        return true
    } else {
        if (!OpenAIConfig.OpenAIGroup.length) {
            e.reply(`检测到还没有群配置，[请先设置要开启的群，然后就会只使用开启的群]，即没有设置的群不开启，暂时没有黑名单，只有白名单`)
        } else {
            let GroupIndex = OpenAIConfig.OpenAIGroup.indexOf(GroupNum.toString())
            if (GroupIndex !== -1) {
                OpenAIConfig.OpenAIGroup.splice(GroupIndex, 1)
                await fs.writeFileSync(OpenAIPath, JSON.stringify(OpenAIConfig))
                e.reply(`已关闭群[${GroupNum}]的OpenAI功能喵~`)
                return true
            } else {
                e.reply(`检测到群[${GroupNum}]并没有开启OpenAI功能喵~，不用关闭`)
            }
        }
    }
    return true
}

export async function SetMaxToMakeMsg(e) {
    if (!e.isMaster) {
        e.reply("你不能设置我的回复数字格式哇喵！")
        return true
    }
    let path = `${process.cwd()}/plugins/FanSky_Qs/config/config.json`
    path = path.replace(/\\/g, '/')
    let OpenAIJson = JSON.parse(fs.readFileSync(path))
    if (!OpenAIJson.Text_img) {
        OpenAIJson.Text_img = 150
        await fs.writeFileSync(path, JSON.stringify(OpenAIJson))
        return false
    }
    let MaxTextNum = e.msg.match(/#设置(OpenAI|模型|语言模型|OpenAI模型)转合并(\d+)/)[2]
    OpenAIJson.Text_img = MaxTextNum
    try {
        await fs.writeFileSync(path, JSON.stringify(OpenAIJson))
        e.reply(`设置成功喵~\n当我的消息大于[${MaxTextNum}]字时，将转为合并消息喵~`)
    } catch (err) {
        e.reply(`好像设置失败了~\n看一下后台吧`)
        console.log(err)
    }
    return true
}

export async function SetOpenAIKey(e) {
    if (!e.isMaster) {
        e.reply('打咩，只有主人能够设置Key~')
        return true
    }
    if (e.isGroup) {
        e.reply('主人，这种事情我们私聊好不好qwq~')
        return true
    }
    let Key = e.msg.match(/#(设置|更改|修改|添加|更换)(OpenAI|模型|语言模型|OpenAI模型)key(.*)/)[3]
    if (!Key || Key.length < 10) {
        e.reply('你的Key好像不太对喵~\n大概格式：sk-xxxxxxxxxxx....\n获取：OpenAI官网')
        return true
    }
    let path = `${process.cwd()}/plugins/FanSky_Qs/config/config.json`
    path = path.replace(/\\/g, '/')
    let OpenAIJson = JSON.parse(fs.readFileSync(path))
    OpenAIJson.OpenAI_Key = Key
    await fs.writeFileSync(path, JSON.stringify(OpenAIJson))
    e.reply(`Key设置成功~\nOpenAI_Key:${Key} \n触发方式：艾特或回复机器人说话即可`)
    return true
}

export async function ChangeAISignMode(e) {
    if (!e.isMaster) {
        e.reply('打咩，你还不可以控制这个噢(Ｔ▽Ｔ)~')
        return true
    }
    let path = `${process.cwd()}/plugins/FanSky_Qs/config/config.json`
    path = path.replace(/\\/g, '/')
    let OpenAIJson = JSON.parse(fs.readFileSync(path))
    let SignMode = e.msg.match(/#?(设置|更改|修改)模型打卡(开启|打开|启用|关闭|不启用)/)[2]
    // 读取SignMode，如为开启、打开、启用，则为true，否则为false
    let ModeSta = !!(SignMode === '开启' || SignMode === '打开' || SignMode === '启用')
    if (ModeSta) {
        OpenAIJson.SignMode = '开启'
        await fs.writeFileSync(path, JSON.stringify(OpenAIJson))
        e.reply('艾特对话 绑定打卡系统开启')
    } else {
        OpenAIJson.SignMode = '关闭'
        await fs.writeFileSync(path, JSON.stringify(OpenAIJson))
        e.reply('艾特对话 绑定打卡系统关闭')
    }
    return true
}

export async function ChangeAIModelMode(e) {
    if (!e.isMaster) {
        e.reply('打咩，你还不可以控制这个噢(Ｔ▽Ｔ)~')
        return true
    }
    let path = `${process.cwd()}/plugins/FanSky_Qs/config/config.json`
    path = path.replace(/\\/g, '/')
    let msg = e.msg
    let ModelMode = Number(msg.match(/\d+/)[0])
    let OpenAIJson = JSON.parse(fs.readFileSync(path))
    if (ModelMode === 1) {
        OpenAIJson.ModelMode = ModelMode
        await fs.writeFileSync(path, JSON.stringify(OpenAIJson))
        e.reply(`您选择了模式${ModelMode}:\n1:每轮重置,不记忆对话`)
    } else if (ModelMode === 2) {
        OpenAIJson.ModelMode = ModelMode
        await fs.writeFileSync(path, JSON.stringify(OpenAIJson))
        e.reply(`您选择了模式${ModelMode}：\n每轮不重置,记忆对话`)
    } else {
        e.reply(`您选择了模式${ModelMode},暂时仅支持1和2两种模式~\n1:每轮重置\n2:每轮不重置,记忆对话\n当前模型模式：${OpenAIJson.ModelMode}}`)
    }
    return true
}

export async function addBlackList(e) {
    if (!e.isMaster) {
        e.reply('打咩，你在赣神魔！∑(ΦдΦlll~')
        return true
    }
    let path = `${process.cwd()}/plugins/FanSky_Qs/config/config.json`
    path = path.replace(/\\/g, '/')
    let msg = e.msg
    let QQ = Number(msg.match(/\d+/)[0])
    let OpenAIJson = JSON.parse(fs.readFileSync(path))
    if (OpenAIJson.BlackList.indexOf(QQ) === -1) {
        OpenAIJson.BlackList.push(QQ)
        await fs.writeFileSync(path, JSON.stringify(OpenAIJson))
        e.reply(`已将${QQ}加入黑名单`)
    } else {
        e.reply(`${QQ}已经在黑名单中了`)
    }
    return true
}

export async function SetPersona(e) {
    let Persona = e.msg.match(/#?(设置|更改|修改)模型人设(.*)/)[2]
    if (Persona.length <= 6) {
        e.reply('好短，我不同意这个设定，再想一个更好的嘛！(∩ﾟдﾟ)')
        return true
    }
    await redis.set(`FanSky:OpenAI:Person:${e.user_id}`, JSON.stringify({
        Person: `${Persona}`,
        type: `singlePerson`
    }))
    let PersonStr = Persona.length > 10 ? `${Persona.slice(0, 10)}...` : Persona
    logger.info(logger.magenta(`${e.user_id}:-设置人设：${PersonStr}`));
    e.reply(`已将您的人设设置为：\n${PersonStr}`)
    return true
}

export async function ChangeAIModel(e) {
    if (!e.isMaster) {
        e.reply('打咩，你还不可以控制这个噢(Ｔ▽Ｔ)~')
        return true
    }
    let path = `${process.cwd()}/plugins/FanSky_Qs/config/config.json`
    path = path.replace(/\\/g, '/')
    let msg = e.msg
    let model = Number(msg.match(/\d+/)[0])
    if (model === 1 || model === 2) {
        let OpenAIJson = JSON.parse(fs.readFileSync(path))
        OpenAIJson.Model = model
        await fs.writeFileSync(path, JSON.stringify(OpenAIJson))
        let Model_list = (await getCfg(yunPath, 'config')).Model_list
        e.reply(`已切换为${model}号模型: ${Model_list[model - 1]}`)
    } else {
        e.reply(`您选择了${model}号模型,暂时仅支持1号和2号模型~`)
    }
    return true
}
