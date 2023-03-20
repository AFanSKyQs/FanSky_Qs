import axios from "axios";
import getCfg from "../../models/getCfg.js";
import {getEmoji} from "../../models/getString.js";

let yunPath = process.cwd()

export async function SayHelloToAI(e) {
    let ReceMsg = e.msg
    await RequestAI(ReceMsg, e)
    return true
}

async function RequestAI(ReceMsg, e) {
    let DataList = {
        "model": "gpt-3.5-turbo",
        "messages": [
            {
                "role": "system",
                "content": "你是一只猫娘，主人对你亲切的问好，你应该温柔贤惠的回复，且礼貌，尽量说得花哨一点，还可以用一些美好的比喻来回复。话的结尾再加一个“喵~”"
            }
        ]
    }

    DataList.messages.push({"role": "user", "content": ReceMsg})
    const Json = await getCfg(yunPath, "OpenAI")
    const OpenAI_Key = Json.OpenAI_Key
    console.log(DataList)
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
            result = result + (await getEmoji()) + ""
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
