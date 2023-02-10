import {segment} from "oicq";
import fs from "fs";
import puppeteer from "../../../lib/puppeteer/puppeteer.js";
import plugin from '../../../lib/plugins/plugin.js'
import gsCfg from '../../genshin/model/gsCfg.js'

let Paimon_path = `${process.cwd()}/plugins/FanSky_Qs/resources/派蒙的星光考察/`
let tipsPath= `${Paimon_path}元素提示图/`
let RoleImgPath = `${Paimon_path}/角色图标/`
let Mp3Path = `${Paimon_path}/音频/`
let roleNum
let roleState=false
let minutes=3
export class PemonStar extends plugin {
    constructor() {
        super({
            /** 功能名称 */
            name: '派蒙的星光考察',
            dsc: '派蒙的星光考察',
            event: 'message',
            priority: 3141,
            rule: [
                {
                    reg: "^#?(派蒙的星光考察|星光考察)$",
                    fnc: 'guessRole'
                },{
                    reg: "^#?猜(.*)$",
                    fnc: 'guess'
                }
            ]
        })
    }
    async guess(e) {
        if(!e.isGroup) {
            return false
        }
        if(roleState[e.group_id] === false){
            e.reply("派蒙还没开始考察或者已经结束了哦~")
            return true
        }
        let Msg=e.msg
        let role = Msg.replace(/#?猜/g, "").replace(/ /g, "").replace(/[\r|\t]/g, "").replace(/[\n|\r]/g, "")
        if(role === role){
            e.reply("恭喜你猜对啦~")
            roleState[e.group_id] = true
        }else{
            e.reply("猜错啦~")
        }
        return true
    }
    async guessRole(e) {
        if(!e.isGroup) {
            e.reply("请群聊发起~")
            return true
        }
        let role = Math.floor(Math.random() * 17) + 1
        // let roleImg = RoleImgPath +"1000"+ role + ".png"
        let tipsImg = tipsPath + `gamePage_role${role}_0` + ".png"
        let mp3 = Mp3Path + `select${role}_0.mp3`
        await e.reply("好哒！派蒙的星光考察开始啦~,请根据元素提示图和派蒙哼唱猜角色~\n请发送【猜+角色名】来猜角色哦~\n如：猜妮露\n为时"+minutes+"分钟哦~")
        setTimeout(async () => {
            if(roleState[e.group_id] === true){
                await e.reply("时间到啦~,还没有人猜出来噢~,派蒙要公布答案喽~")
                roleNum[e.group_id] = role
                roleState[e.group_id] = true
            }
        } , 1000*60*minutes)
        // await e.reply(segment.image(`file:///${roleImg}`))
        await e.reply(segment.image(`file:///${tipsImg}`))
        await e.reply(segment.record(mp3))
        return true
    }
    async Mp3ToSilk(e) {//预计功能：音频转换，高清语音
    }
}
