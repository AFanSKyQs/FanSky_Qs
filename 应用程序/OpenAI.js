let OpenAI_Key="这里填你的Key"
import plugin from "../../../lib/plugins/plugin.js";
import common from "../../../lib/common/common.js";
import puppeteer from "../../../lib/puppeteer/puppeteer.js"
import Markdown_it from "markdown-it"
import axios from "axios";
import {createRequire} from "module";
import fs from "fs";
//已自动除开#开头命令
// 每个人的单次对话长度，即存储的记忆轮数，管理员不受限，直到报错
let userCount = [0]  //从一开始艾特开始，回复8次即为9轮，即重置该人的对话
let CountMember=9
let adminCount = 99  //管理员不受限制，直到报错
let BlackList = []   //黑名单
const MarkDownIT = new Markdown_it()
let Model = "text-davinci-003"
let banQQ = []    //禁止使用的QQ号
let BotName ="2233"
let _path = `${process.cwd()}/resources/FanSky`
let path = `${process.cwd()}/resources/FanSky/SignIn.json`
let path_SignTop = `${process.cwd()}/resources/FanSky/SignTop.json`
let htmlPath = `${process.cwd()}/plugins/FanSky_Qs/resources/OpenAI/`
let cssPath = `${htmlPath}OpenAI.html`
let Axios=[]
// 对话列表
let OpenAIList = [""]
// const path=process.cwd()//获取当前路径
// const Html_path = `${process.cwd()}/plugins/FanSky_Qs/resources/ChatGPT/`//html文件路径
// const Html__path = `${Html_path}ChatGPT.html`//html文件路径
// let salt = '1435660288'//一个salt，不用改，随机的
// let appid = "20221021001405138"//换成你的appid，直接用我的有ip检测，不行的，当然也可以私我给你服务器加一个ip即可
// let key = "Yk3UXB0Lxx_CfCsNc9aU"//换成你的key，直接用我的有ip检测，不行的，当然也可以私我给你服务器加一个ip即可

export class OpenAI extends plugin {
    constructor() {
        super({
            name: 'OpenAI_ChatGPT',
            dsc: 'OpenAI_ChatGPT',
            event: 'message',
            // 优先级(数值越小优先度越高)
            priority: 9,
            // 消息匹配规则
            rule: [
                {
                    // 清空所有Axios、OpenAIList、userCount
                    reg: /^#清空所有|#清空全部|#清除所有|#清除全部$/i,
                    fnc:'DelAll'
                },
                // {
                // //reg匹配"#原图"或者"原图"
                // // reg: /#原图/,
                //     reg:/^#?原图$/,
                //     fnc:'yt'
                // },
                {
                    //reg匹配所有包含"面板图列表"的消息
                    reg: '面板图列表',
                    fnc:'mbt'
                },{
                    //reg匹配"#对话列表"
                    reg: /#对话列表|#聊天列表|#会话列表/,
                    fnc:'Axios_list'
                },
                {
                    //reg匹配所有非"#开头"的信息

                    reg: /.*/i,
                    // reg: '',
                    fnc: 'OpenAI',
                    log:false
                }
            ]
        })
    };
    async DelAll(e){
        if(!e.isMaster){
            return true
        }else{
            OpenAIList = [""]
            userCount = [0]
            Axios = []
            e.reply("已清空所有")
            return true
        }
    }
    async Axios_list(e){
        if(!e.isMaster){
            return true
        }else{
            if(!OpenAIList.length){
                e.reply("对话列表为空")
                return true
            }
            await ScreenAndSend(e,OpenAIList[0])
        }
    }
    // async yt(e){
    //     if(!e.user_id===3141865879){
    //         e.reply("涩涩打咩...打咩打咩~")
    //         return true
    //     }else{
    //         return false
    //     }
    // }
    async mbt(e){
        if(!e.isMaster){
            return true
        }else{
            return false
        }
    }
    async SingIn(e){

        if (!fs.existsSync(_path)) {
            console.log("已创建FanSky文件夹");
            fs.mkdirSync(_path);
        }
        if (!fs.existsSync(path)) {
            fs.writeFileSync(path, '{}');
            console.log("已创建SignIn.json文件");
        }
        if (!fs.existsSync(path_SignTop)) {
            fs.writeFileSync(path_SignTop, '{}');
            console.log("已创建SignTop.json文件");
        }
        let SignDay = JSON.parse(fs.readFileSync(path));
        if (!SignDay[e.group_id]) {
            SignDay[e.group_id] = {};
        }
        if (!SignDay[e.group_id][e.user_id] ) {
            e.reply("没有您的打卡记录\n请发送[打卡/签到/冒泡]来打卡\n获取原石以进行提问");
            fs.writeFileSync(path, JSON.stringify(SignDay));
            return
        }
        if(SignDay[e.group_id][e.user_id].rough<8 && !e.isMaster){
            e.reply(`您的[原石]：${SignDay[e.group_id][e.user_id].rough}\n少于8，已无法进行对话\n继续努力吧~`);
            return
        }
        if(!e.isMaster){
            SignDay[e.group_id][e.user_id].rough -= 8;
        }
        fs.writeFileSync(path, JSON.stringify(SignDay));
        return SignDay[e.group_id][e.user_id].rough
    }
    async OpenAI(e) {
        if(!e.isGroup && !e.isMaster){
            return false
        }
        if (!e.msg) return false
        if (!e.msg.includes(BotName) && !e.atBot) return false
        if (banQQ.includes(e.user_id)) return false
        let msg = e.msg.trim().replace(/[\n|\r]|2233/g, '，')
        Bot.logger.info("处理插件：OpenAI:"+`\n群组：${e.group_id}\n`+"用户:"+`${e.user_id}\n`+`消息：${msg}`)
        if (!msg) {
            e.reply("你想对我说什么呢？baka不要空白呀！", true)
            console.log("消息为空")
            return true
        }
        if(msg.includes("原图")&& msg.length<=4 && !e.isMaster){
            e.reply("涩涩打咩...打咩打咩~", true)
            console.log("不给原图！")
            return true
        }
        if (/^#/.test(e.msg)) { //如果是命令
            // e.reply("如果是想与AI对话\n请不要在开头输入#\n【这一般是指令】\n\n如果是指令请不要艾特机器人\n【艾特一般是与机器人对话】", true)
            return false
        }
        // if(msg.length<3 ){
        //     e.reply("小于3个字符，已过滤", true)
        //     console.log("消息太短,如果是指令请不要艾特我哇！")
        //     return true
        // }
        if(BlackList.includes(e.user_id)){
            // e.reply("你已被拉黑，无法使用本插件！", true)
            console.log("黑名单")
            return true
        }
        let GetResult=await this.SingIn(e)
        if(!GetResult){
            console.log("没有返回结果，已退出")
            return true
        }
        // 如果没有或为空则返回
        if(!Axios[e.user_id]){
            Axios[e.user_id]=[""]
            //为了防止无法在字符串上创建属性，所以先创建一个空字符串
            OpenAIList[0]=OpenAIList[0]+`【${OpenAIList.length}】:${e.user_id}\n`
        }
        if(!userCount[e.user_id] || userCount[e.user_id][0] === 0){
            userCount[e.user_id] = 0
            if(e.isMaster){
                userCount[e.user_id]=adminCount
            }else{
                userCount[e.user_id]=CountMember
            }
            Axios[e.user_id]=[""]
        }
        //给Axios[e.user_id]的第一个元素的字符串后面加上msg，然后再把这个字符串赋值给Axios[e.user_id]的第一个元素
        Axios[e.user_id][0] = Axios[e.user_id][0] + `\nHuman:${msg}`
        console.log("Axios:"+Axios[e.user_id][0])
        const OpenAI = {
            "model": `${Model}`,
            "prompt": Axios[e.user_id][0],
            "max_tokens": 2048,
            "temperature": 0.3, //作用是控制生成的文本的多样性
            "top_p": 1,     //作用是
            "frequency_penalty": 0, //作用是
            "presence_penalty": 0.6,//
            "stop":[" Human:", " AI:"]
        };
        try {
            userCount[e.user_id]=userCount[e.user_id]-1;
            await this.OpenAI_Get(e, OpenAI,GetResult)
            //如果返回的消息长度大于150，就封装发送
        } catch (err) {
                e.reply("AI出问题了，正在呼叫管理员...\n【如您是命令请在前面加#号】\n", true)
                await common.sleep(3000)
                await Bot.pickFriend(3141865879).sendMsg(`错误信息：${err}\n群组：${e.group_id}\n`+"用户:"+`${e.user_id}`)
                console.log(err)
                return true
        }
    }
    async OpenAI_Get(e,PostDate,GetResult) {
        // let Msg
        try {
            axios({
            method: 'post',
            url: 'https://api.openai.com/v1/completions',
            headers: {
                'Content-Type': "application/json",
                'Accept-Encoding': 'gzip,deflate',
                'Content-Length': 1024,
                'Transfer-Encoding': 'chunked',
                'Authorization': 'Bearer ' + OpenAI_Key
            },
            data: JSON.stringify(PostDate)
        }).then(async function (response) {
            let ReciveMsg = response.data.choices[0].text
                let Axios_Temp = ReciveMsg
                    .replace(/机器人：/, "").trim()
                    .replace(/\n/, "").trim()
                    .replace(/答：/, "").trim()
                    .replace(/AI:/, "").trim()
                    .replace(/Bot:/, "").trim()
                    .replace(/robot:/, "").trim()
                    .replace(/Robot:/, "").trim()
                    .replace(/Computer:/, "").trim()
                    .replace(/computer:/, "").trim()
                if (Axios_Temp.startsWith("，") || Axios_Temp.startsWith("？")||Axios_Temp.startsWith("?")||Axios_Temp.startsWith(",")||Axios_Temp.startsWith("。")) {
                    Axios_Temp = Axios_Temp.slice(1)
                }
                if(Axios_Temp.startsWith("吗？")||Axios_Temp.startsWith("吗?")){
                    // 删除前俩
                    Axios_Temp = Axios_Temp.slice(2)
                }
                // Msg = ReciveMsg.trim().replace(/[\n|\r]|AI:/g, '')
                // Msg=Msg.replace(/答：/, "").trim()
                //     .replace(/机器人：/, "").trim()
                //     .replace(/AI:/, "").trim()
                //     .replace(/Bot:/, "").trim()
                //     .replace(/robot:/, "").trim()
                //     .replace(/Robot:/, "").trim()
                //     .replace(/Computer:/, "").trim()
                //     .replace(/computer:/, "").trim()
                // //如果Msg是以"，"或"?"开头的，就去掉开头这个符号
                // if (Msg.startsWith("，") || Msg.startsWith("？")||Msg.startsWith("?")||Msg.startsWith(",")||Msg.startsWith("。")) {
                //     Msg = Msg.slice(1)
                // }
                // if(Msg.startsWith("吗？")||Msg.startsWith("吗?")){
                //     // 删除前俩
                //     Msg = Msg.slice(2)
                // }
                // 在Msg的开头加一个"【】"符号
                Axios[e.user_id][0] = Axios[e.user_id][0]+"\nAI:" + Axios_Temp
                if (!Axios_Temp.startsWith("【")) {
                    Axios_Temp = `【距离对话重置：${userCount[e.user_id]}】\n【消耗8原石 | 剩余：${GetResult}】` + Axios_Temp
                }
                // console.log("OpenAI:" + Axios_Temp)
                if(userCount[e.user_id]===0){
                    if(e.isMaster){
                        userCount[e.user_id]=adminCount
                    }else {
                        userCount[e.user_id]=CountMember
                    }
                    Axios[e.user_id]=[""]
                    e.reply("对话记录已经重置，将开始新的记忆。")
                }
                // let SendMsg = ReciveMsg.trim().replace(/[\n|\r]|AI:/g, '<br>')
                if (Axios_Temp.length > 80) {
                    await ScreenAndSend(e, Axios_Temp)
                }else{
                    e.reply(Axios_Temp, true)
                }
            }).catch(function (error) {
                console.log(error);
                Axios[e.user_id]=[""]
                e.reply("超过上限，已重置对话", true)
                console.log("超过对话上限！")
            });
        }catch (err) {
            e.reply("AI出错了！正在呼叫管理员...\n【如您是发送命令请在前面加#号】", true)
            console.log(err)
            return true
        }
        return true
    }
}
async function ScreenAndSend(e, message) {
    if(message){
        // let OpenAI = MarkDownIT.render(message)
        // console.log(OpenAI)
        console.log("OpenAI:" + message)
        // 这个是message的内容
        // const bubbleSort = (arr) => {
        //     for (let i = 0; i < arr.length; i++) {
        //         for (let j = 0; j < arr.length - i - 1; j++) {
        //             if (arr[j] > arr[j + 1]) {
        //                 let temp = arr[j];
        //                 arr[j] = arr[j + 1];
        //                 arr[j + 1] = temp;
        //             }
        //         }
        //     }
        //     return arr;
        // }
        // 将其格式化成html可以正常显示的格式，并且原本有空格的地方也会有空格
        let OpenAI = message.replace(/ /g, "&nbsp;").replace(/\n/g, "<br>")
        // let OpenAI = message.replace(/[\n|\r]/g, '<br>')
        let img= await puppeteer.screenshot("OpenAI", {tplFile: cssPath, htmlDir: htmlPath, OpenAI}) //截图
        e.reply(img)
        //关闭浏览器
        return true
    }else{
        e.reply("消息为空，已退出")
        return true
    }
}
