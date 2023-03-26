import {segment} from "oicq";
import plugin from "../../../../lib/plugins/plugin.js";
import {thuMUp} from "./DianZan.js";
import {CatEyeBoxOffice} from "./CatsEyeBoxOffice.js";
import {YiyanDinZhen} from "./YiyanDinZhen.js";
import {Complaint} from "./ReplyComplaint.js";
import {OnOFF} from "./ON-OFF.js";
import {AT_Xiaozuo7_CxkEmo} from "./AT_Xiaozuo7_CxkEmo.js";
let urls_one="http://api.andeer.top/API/word_pic1.php"
export class SmallFunctionsindex extends plugin {
    constructor() {
        super({
            name: 'FanSky小功能Index',
            dsc: 'FanSky小功能',
            event: 'message',
            priority: 3141,
            rule: [
                {
                    reg: /^#?(点赞|赞我|点zan)$/,
                    fnc: 'thuMUp',
                },{
                    reg: /^#?(电影|猫眼|实时)?票房$/,
                    fnc: 'CatEyeBoxOffice'
                },{
                    // 清空所有Axios、OpenAIList、userCount
                    reg: /^#?(一眼丁真|一眼鼎真|一眼定真|一眼顶针|遗言顶针|遗言鼎真|遗言丁真|遗言定真)$/i,
                    fnc:'YiyanDinZhen'
                },{
                    reg: /.*/i,
                    fnc: 'Complaint',
                }, {
                    reg: /#(发病|发电|发癫|发疯)/,
                    fnc: 'Complaint'
                },{
                    reg: /^#(开启|打开|open|关闭|启用)(fan|Fansky|Fan|fans)点赞$/,
                    fnc: 'OnOFF'
                },{
                    // 清空所有Axios、OpenAIList、userCount
                    reg: /^#?(鸡哥|ikun|小黑子|小ji子|小鸡子|村路人|纯路人|纯鹿人|个人练习生|真虾头|感觉没必要|一眼丁鸡|一眼丁ji|cxk)$/i,
                    fnc:'AT_Xiaozuo7_CxkEmo'
                }
            ]
        })
    }
    async AT_Xiaozuo7_CxkEmo(e){
        let Static=await AT_Xiaozuo7_CxkEmo(e)
        if(!Static || Static===false){
            return false
        }
    }
    async OnOFF(e) {
        let Static=await OnOFF(e)
        if(!Static || Static===false){
            return false
        }
    }
    async thuMUp(e) {
        let Static=await thuMUp(e)
        if(!Static || Static===false){
            return false
        }
    }
    async CatEyeBoxOffice(e) {
        let Static=await CatEyeBoxOffice(e)
        if(!Static || Static===false){
            return false
        }
    }
    async YiyanDinZhen(e) {
       let Static= await YiyanDinZhen(e)
        if(!Static || Static===false){
            return false
        }
    }
    async Complaint(e) {
        let Static= await Complaint(e)
        if(!Static || Static===false){
            return false
        }
    }

}
