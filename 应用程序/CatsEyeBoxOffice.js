import plugin from "../../../lib/plugins/plugin.js";
import {getUrlJson} from "../models/getUrlJson.js";
import {segment} from "oicq";
import common from "../../../lib/common/common.js";

export class CatsEyeBoxOffice extends plugin {
    constructor() {
        super({
            name: '猫眼票房',
            dsc: '猫眼票房',
            event: 'message',
            priority: 8,
            rule: [
                {
                    reg: /^#?(电影|猫眼|实时)?票房$/,
                    fnc: 'CatEyeBoxOffice',
                },
            ]
        })
    }
    async CatEyeBoxOffice(e) {
        // 获取当前时间戳
        let nowTime = new Date().getTime()
        let random32 = await this.getId32()
        let url=`http://pf.fe.st.maoyan.com/dashboard-ajax?orderType=0&uuid=57b6168c-1503-4e64-b1bb-f1f2da22316d&timeStamp=${nowTime}&User-Agent=TW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzEwOS4wLjAuMCBTYWZhcmkvNTM3LjM2IEVkZy8xMDkuMC4xNTE4Ljcw&index=49&channelId=40009&sVersion=2&signKey=${random32}`
        let Json=await getUrlJson(url, e)
        let UpdateTime=new Date(Json.movieList.data.updateInfo.updateTimestamp).toLocaleString();
        let MsgList=[]
        MsgList.push(
            `实时大盘：${Json.movieList.data.nationBoxInfo.nationBoxSplitUnit.num} ${Json.movieList.data.nationBoxInfo.nationBoxSplitUnit.unit}\n
            总出票为：${Json.movieList.data.nationBoxInfo.viewCountDesc}张\n
            总场次为：${Json.movieList.data.nationBoxInfo.showCountDesc}场\n
            更新时间：${UpdateTime}\n
            数据来源：猫眼电影`)
        for(let i=0;i<Json.movieList.data.list.length;i++){
            MsgList.push(
                `排名：${i+1} | ${Json.movieList.data.list[i].movieInfo.releaseInfo}\n
                《${Json.movieList.data.list[i].movieInfo.movieName}》\n
                票房：加密反爬[破解中] | ${Json.movieList.data.list[i].boxRate}\n
                均场人次：${Json.movieList.data.list[i].avgShowView} 人 | ${Json.movieList.data.list[i].avgSeatView} \n
                今日排片：${Json.movieList.data.list[i].showCount} | ${Json.movieList.data.list[i].splitBoxRate}\n
                ${segment.image(await this.getMoviImg(Json.movieList.data.list[i].movieInfo.movieId,e))}`)
        }
        await this.SendMsg(e,MsgList)
        return true
    }
    async SendMsg(e,MsgList){
        let Msg=await common.makeForwardMsg(e,MsgList,`猫眼票房 | FanSky_Qs~`)
        try {
            // let send=e.reply(res_one,false, { at: false, recallMsg: 30 })
            let SendStatus=await e.reply(Msg)
            if (!SendStatus) {
                await e.reply("哎呀，发送失败了...",true)
                return true
            }
        } catch (err) {
            console.log(err)
            await e.reply("哎呀，发送失败了...",true)
        }
        return true
    }
    async getId32() {
        const list = [];
        const range= '0123456789abcdefghijklmnopqrstuvwxyz';
        for (let i = 0; i < 32; i++) {
            list [i] = range.substr(Math.floor(Math.random() * 0x10), 1);
        }
        list [19] = '4';
        return list.join('');
    }
    async getId2_3(){
        return Math.floor(Math.random() * (999 - 100 + 1) + 100)
    }

    async getMoviImg(ID,e){
        let random32=await this.getId32()
        let randomNum=await this.getId2_3()
        let url=`https://piaofang.maoyan.com/dashboard-ajax/movie?movieId=${ID}&orderType=0&uuid=186027caaacc8-0ab79fdfce64b4-7d5d5474-144000-186027caaac4d&timeStamp=1675092410660&User-Agent=TW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzEwOS4wLjAuMCBTYWZhcmkvNTM3LjM2IEVkZy8xMDkuMC4xNTE4Ljcw&index=${randomNum}&channelId=40009&sVersion=2&signKey=${random32}`
        let Json=await getUrlJson(url,e)
        return Json.movieInfo.movieInfo.imgUrl
    }
}

