import fs from "fs";
import {segment} from "oicq";

let DinZhen_Path = `${process.cwd()}/plugins/FanSky_Qs/resources/YiyanDinzhen/img/`
export class YiyanDinZhen extends plugin {
    constructor() {
        super({
            name: 'YiyanDinZhen',
            dsc: 'YiyanDinZhen',
            event: 'message',
            // 优先级(数值越小优先度越高)
            priority:3141,
            // 消息匹配规则
            rule: [
                {
                    // 清空所有Axios、OpenAIList、userCount
                    reg: /^#?(一眼丁真|一眼鼎真|一眼定真|一眼顶针|遗言顶针|遗言鼎真|遗言丁真|遗言定真)$/i,
                    fnc:'YiyanDinZhen'
                },
            ]
        })
    };
    async YiyanDinZhen(e) {
    //     DinZhen_Path路径下包括了要发送的图片
    //     随机发送一张图片
        let img = DinZhen_Path + fs.readdirSync(DinZhen_Path)[Math.floor(Math.random() * fs.readdirSync(DinZhen_Path).length)]
        // 发送这个路径的图片
        await e.reply(segment.image(`file:///${img}`),true)
        // 关闭图片
        return true
    }
}