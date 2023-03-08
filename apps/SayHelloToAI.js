import axios from "axios";
import getCfg from "../models/getCfg.js";
import {getEmoji} from "../models/getString.js";
let yunPath = process.cwd()
export class SayHelloToAI extends plugin {
    constructor() {
        super({
            name: '接入AI早安晚安午安',
            dsc: '接入AI早安晚安午安',
            event: 'message',
            // 优先级(数值越小优先度越高)
            priority: 10,
            // 消息匹配规则
            rule: [
                {
                    reg: /#?(早|早上|上午|午|中午|下午|晚|晚上|午夜|半夜|凌晨|深夜)(好！|好!|好呀!|好呀！|好|安|安好梦|好呀|愉快|好喵！|好喵!|好喵)(.*)/,
                    fnc: 'SayHelloToAI'
                },{
                    reg: "^早$",
                    fnc: 'SayHelloToAI'
                },
            ]
        })
    };
    async SayHelloToAI(e){
        let ReceMsg = e.msg
        await this.RequestAI(ReceMsg,e)
        return true
    }
    async RequestAI(ReceMsg,e){
        let DataList = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {"role": "system", "content": "你是一只猫娘，主人对你亲切的问好，你应该温柔贤惠的回复，且礼貌，尽量说得花哨一点，还可以用一些美好的比喻来回复。话的结尾再加一个“喵~”"}
            ]
        }
        DataList.messages.push({"role": "user", "content": ReceMsg})
        const Json = await getCfg(yunPath, "OpenAI")
        const OpenAI_Key = Json.OpenAI_Key
        try {
            axios({
                method: 'post',
                url: 'https://api.openai.com/v1/chat/completions',
                headers: {
                    'Content-Type': "application/json",
                    'Authorization': 'Bearer ' + OpenAI_Key
                },
                data: JSON.stringify(DataList),
                proxy: {
                    protocol: 'http',
                    host: '127.0.0.1',
                    port: 7890,
                },
            }).then(async function (response) {
                console.log(response.data.choices[0])
                let result = response.data.choices[0].message.content
                result=result+(await getEmoji())+""
                e.reply(result, true)
            }).catch(async function (error) {
                let emoji = await getEmoji()
                e.reply(`喵呜qwq！你也好呀${emoji}~`)
                console.log(error);
            });
        } catch (err) {
            e.reply("运行有问题~,请联系开发人员(3141865879)")
            console.log(err)
        }
    }
}