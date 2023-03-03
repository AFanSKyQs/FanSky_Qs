import fs from "fs";
import common from "../../../lib/common/common.js";
import plugin from "../../../lib/plugins/plugin.js";
import puppeteer from "../../../lib/puppeteer/puppeteer.js"
import { segment } from "oicq"
import {getAcgBg, getBgImg, getByImg, getTuImg} from "../models/getTuImg.js";
import {getGroup} from "../models/getGroupList.js";
import {getWords} from "../models/getAwords.js";
import crypto from "crypto";
let DelPath=`${process.cwd()}/data/html/UserCard/`
let _path = `${process.cwd()}/resources/FanSky`
let path = `${process.cwd()}/resources/FanSky/SignIn.json`
let CssPath = `${process.cwd()}/plugins/FanSky_Qs/resources/Card/`
let path_SignTop = `${process.cwd()}/resources/FanSky/SignTop.json`
let htmlPath = `${process.cwd()}/plugins/FanSky_Qs/resources/Card/Card.html`
const name = '22、33'
let Acg_url = [`https://dev.iw233.cn/api.php?sort=cat`,'https://api.gmit.vip/Api/DmImg?format=image']
let Acg_url_ = Acg_url[Math.floor(Math.random() * Acg_url.length)]
export class ClockIn extends plugin {
    constructor() {
        super({
            name: '打卡',
            dsc: '打卡，签到',
            event: 'message',
            priority: 8,
            rule: [
                {
                    reg: /^#?(打卡|冒泡|冒泡泡)$/,
                    fnc: 'SingleTest',
                },
                {
                    reg: /^签到$/,
                    fnc: 'SingleTest',
                },
                {
                    reg: /^🌨️🔥$/,
                    fnc: 'SingleTest',
                },
                {
                    reg: /^#?(首次|最开始|第一次|第1次|第one次)(打卡|冒泡|签到|冒泡泡)时间?$/,
                    fnc: 'FirstSignTime',
                },
            ]
        })
    }
    async FirstSignTime(e) {
        if (!fs.existsSync(_path)) {
            console.log("已创建FanSky文件夹");
            fs.mkdirSync(_path);
        }
        //先判创建json文件,文件位置在../../resources/SignIn.json
        if (!fs.existsSync(path)) {
            fs.writeFileSync(path, '{}');
            console.log("已创建SignIn.json文件");
        }
        //将打卡信息写入json文件，每个群的群号和用户的QQ号作为键,添加打卡时间、打卡天数、打卡次数、连续打卡次数、今日是否打卡
        let SignDay = JSON.parse(fs.readFileSync(path));
        if (!SignDay[e.user_id]) {
            e.reply('你还没有打卡过哦,可以发送【打卡】来进行首次打卡~')
            return true
        }
        let FirstSignTime = new Date(SignDay[e.user_id].FirstSignTime).toLocaleString()
        e.reply(`您首次打卡时间:${FirstSignTime}`)
        return true
    }
    async setCard(e,nowCardNum){
        let nowTime = new Date(Date.now()).toLocaleString();
        let Group=await getGroup(e)
        for(let i=0;i < Group.length; i++){
            await Bot.pickGroup(Group[i]).setCard(Bot.uin, name + '已打卡:' + nowCardNum + ' | 指令不用私聊噢~' )
            await common.sleep(1000)
        }
    }
    async SingleTest(e) {
        if (!e.isGroup) {
            await Bot.sendLike(e.user_id,20)
            await e.reply("赞了噢喵~,可以..可以回我一下嘛o(*////▽////*)q~")
            return true
        }
        //子目录
        if (!fs.existsSync(_path)) {
            console.log("已创建FanSky文件夹");
            fs.mkdirSync(_path);
        }
        //先判创建json文件,文件位置在../../resources/SignIn.json
        if (!fs.existsSync(path)) {
            fs.writeFileSync(path, '{}');
            console.log("已创建SignIn.json文件");
        }
        //再判创建json文件,文件位置在../../resources/SignTop.json
        if (!fs.existsSync(path_SignTop)) {
            fs.writeFileSync(path_SignTop, '{}');
            console.log("已创建SignTop.json文件");
        }
        //将打卡信息写入json文件，每个群的群号和用户的QQ号作为键,添加打卡时间、打卡天数、打卡次数、连续打卡次数、今日是否打卡
        let SignDay = JSON.parse(fs.readFileSync(path));
        let SignTop = JSON.parse(fs.readFileSync(path_SignTop));
        //判断上次打卡时间与这次打卡时间间隔是否大于2分钟
        if (!e.isMaster && SignDay[e.user_id] && (Date.now() - SignDay[e.user_id].time) < 120000) {
            //将本次计数写入json
            SignDay[e.user_id].count++;
            fs.writeFileSync(path, JSON.stringify(SignDay));
            //发送消息，并返还剩余多久可以打卡
            e.reply(`距离上次打卡时间不足2分钟，还需等待${(120000 - (Date.now() - SignDay[e.user_id].time)) / 1000}秒,\n总打卡：【${SignDay[e.user_id].count}】次`);
            return true
        }
        if (!SignDay[e.user_id]) {
            SignDay[e.user_id] = {
                time: 0,
                day: 0,
                count: 0,
                continuous: 0,
                today: false,
                rough: 0,
                FirstSignTime: 0
            };
        }
        if (!SignTop["AllGroupTopTime"]) {
            SignTop["AllGroupTopTime"] = {
                TopToday: 0,
            };
        }
        if (!SignTop["AllGroupTopTime"][e.user_id]) {
                SignTop["AllGroupTopTime"][e.user_id] = {
                TopNumber: SignTop["AllGroupTopTime"].TopToday + 1,
                };
            SignTop["AllGroupTopTime"].TopToday++;
            fs.writeFileSync(path_SignTop, JSON.stringify(SignTop));
            SignTop = JSON.parse(fs.readFileSync(path_SignTop));
        }
        //判断今日是否打卡
        if (SignDay[e.user_id].today) {
            console.log("今日已打卡")
            let addRough=0
            let lastTimeTemp = SignDay[e.user_id].time
            SignDay[e.user_id].count++;
            SignDay[e.user_id].time = Date.now();
            fs.writeFileSync(path, JSON.stringify(SignDay));
            await this.MsgList(e, SignDay, lastTimeTemp, SignTop,addRough);
            return true
        }
        //判断是否是第一次打卡
        if (!SignDay[e.user_id].time || SignDay[e.user_id].time === 0) {
            console.log("首次打卡")
            SignDay[e.user_id].time = Date.now();
            SignDay[e.user_id].count = 1;
            SignDay[e.user_id].day = 1;
            SignDay[e.user_id].continuous = 1;
            SignDay[e.user_id].rough = 160;
            SignDay[e.user_id].FirstSignTime = Date.now();
            SignDay[e.user_id].today = true;
            let addRough=160
            fs.writeFileSync(path, JSON.stringify(SignDay));
            /**SignTop内为所有群的打卡排行榜*/
            await this.FirstList(e, SignDay, SignTop, addRough);
            return true
        }
        //获取打卡时间戳，传入addDay函数，并与今天的日期进行比较，判断是否连续打卡
        let lastDay = new Date(addDay(SignDay[e.user_id].time)).toLocaleDateString();
        let today = new Date().toLocaleDateString();
        console.log("lastDay:" + lastDay)
        console.log("today:" + today)
        if (lastDay === today) {
            console.log("进入了连续打卡")
            let lastTimeTemp = SignDay[e.user_id].time
            SignDay[e.user_id].time = Date.now();
            SignDay[e.user_id].count++;
            SignDay[e.user_id].day++;
            SignDay[e.user_id].continuous++;
            SignDay[e.user_id].today = true;
            let TempRough = await this.GetRough(SignDay[e.user_id].continuous);
            SignDay[e.user_id].rough += TempRough;
            fs.writeFileSync(path, JSON.stringify(SignDay));
            await this.MsgList(e, SignDay, lastTimeTemp, SignTop, TempRough);
            return true
        } else {
            console.log("断签了")
            //断签处理
            let lastTimeTemp = SignDay[e.user_id].time
            SignDay[e.user_id].time = Date.now();
            SignDay[e.user_id].count++;
            SignDay[e.user_id].day++;
            SignDay[e.user_id].continuous = 1;
            SignDay[e.user_id].today = true;
            let TempRough = await this.GetRough(SignDay[e.user_id].continuous);
            SignDay[e.user_id].rough += TempRough;
            fs.writeFileSync(path, JSON.stringify(SignDay));
            await this.MsgList(e, SignDay, lastTimeTemp, SignTop,TempRough);
            return true
        }

        function addDay(timestamp) {
            const date = new Date(timestamp);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const hour = date.getHours();
            const minute = date.getMinutes();
            const second = date.getSeconds();
            const newDate = new Date(year, month - 1, day + 1, hour, minute, second);
            return newDate.getTime();
        }
    }
    async MsgList(e, Data, LastTimeTemp, SignTop,TempRough) {
        let ImgList=await getBgImg()
        let syc,hy,hg,name,salou,star,yuans,Txk1;
        [syc,hy,hg,name,salou,star,yuans,Txk1]=ImgList
        let TuPath=await getTuImg()
        let ByImg=await getByImg()
        let AcgBg=await getAcgBg()
        let LastTime = new Date(LastTimeTemp).toLocaleString();
        let NowTime=new Date(Data[e.user_id].time).toLocaleString();
        let Words =await getWords()
        const UserHtml = {
            addRough:TempRough,
            AcgBg:AcgBg,
            Txk1:Txk1,
            syc:syc,
            hy:hy,
            hg:hg,
            love:name,
            salou:salou,
            yuans:yuans,
            ByImg:ByImg,
            StarImg:star,
            TuPath:TuPath,
            user_tips: "今日打卡成功！",
            user_id: e.user_id, //用户QQ号
            nickname: e.sender.nickname,    //用户昵称
            CardDay: Data[e.user_id].day,   //打卡天数
            CardContinuous: Data[e.user_id].continuous,  //连续打卡天数
            CardCount: Data[e.user_id].count,   //总打卡次数
            CardRough: Data[e.user_id].rough,   //魔晶
            CardTime: Data[e.user_id].time,  //打卡时间戳
            CardLastTime: LastTime, //上次打卡时间
            CardNowTime: NowTime,
            AWords:Words,  //随机一句话
            CardTop: SignTop["AllGroupTopTime"][e.user_id].TopNumber,  //总打卡排行
            user_img: `https://q1.qlogo.cn/g?b=qq&nk=${e.user_id}&s=160`,  //用户头像
            Acg_url:Acg_url_,  //随机图片链接
        }
        let NowSum=SignTop["AllGroupTopTime"].TopToday
        let MsgList=await puppeteer.screenshot("UserCard", {tplFile: htmlPath,quality:100,CssPath, UserHtml});
        await e.reply(MsgList);
        await Bot.pickFriend(e.user_id).thumbUp(20);
        // let MsgListTwo=[segment.at(e.user_id),"\n给你点赞了喵~\n没点上加我好友发【打卡】~"]
        // await e.reply(MsgListTwo)
        await this.setCard(e,NowSum)
        return true
    }
    async FirstList(e, Data, SignTop,TempRough) {
        let ImgList=await getBgImg()
        let syc,hy,hg,name,salou,star,yuans,Txk1;
        [syc,hy,hg,name,salou,star,yuans,Txk1]=ImgList
        let TuPath=await getTuImg()
        let ByImg=await getByImg()
        let AcgBg=await getAcgBg()
        // ["dayL","fire","Kingimg","name","SaLou","star","Yuan"]
        let LastTime = new Date(Data[e.user_id].time).toLocaleString()
        let Words =await getWords()
        const UserHtml = {
            addRough:TempRough,
            AcgBg:AcgBg,
            Txk1:Txk1,
            syc:syc,
            hy:hy,
            hg:hg,
            love:name,
            salou:salou,
            yuans:yuans,
            ByImg:ByImg,
            StarImg:star,
            TuPath:TuPath,
            user_tips:"首次打卡！奖励160原石！",
            user_id: e.user_id, //用户QQ号
            nickname: e.sender.nickname,    //用户昵称
            CardDay: Data[e.user_id].day,   //打卡天数
            CardContinuous: Data[e.user_id].continuous,  //连续打卡天数
            CardCount: Data[e.user_id].count,   //总打卡次数
            CardRough: Data[e.user_id].rough,  //魔晶
            CardTime: Data[e.user_id].time,  //打卡时间戳
            CardLastTime: LastTime, //上次打卡时间
            CardNowTime:LastTime,//现在时间
            AWords:Words,
            CardTop: SignTop["AllGroupTopTime"][e.user_id].TopNumber,  //总打卡排行
            user_img: `https://q1.qlogo.cn/g?b=qq&nk=${e.user_id}&s=160`,  //用户头像
            Acg_url:Acg_url_,  //随机图片链接
        }
        let NowSum=SignTop["AllGroupTopTime"].TopToday
        let MsgList=await puppeteer.screenshot("UserCard", {tplFile: htmlPath,quality:100,CssPath, UserHtml});
        await e.reply(MsgList);
        await Bot.pickFriend(e.user_id).thumbUp(20);
        // let MsgListTwo=[segment.at(e.user_id),"\n给你点赞了喵~\n没点上加我好友发【打卡】~"]
        // await e.reply(MsgListTwo)
        await this.setCard(e,NowSum)
        return true
    }
    async SendMsgUrl(path,e,NowSum){
        // 获取这张图片的Md5码
        let Md5
        await fs.readFile(path,  function (err, data) {
            if (err) return;
            Md5 = crypto.createHash('md5').update(data, 'utf8').digest('hex');
            console.log(Md5);
            Md5 = Md5.toUpperCase();
            Md5=Md5+""
        });
        await Bot.sendPrivateMsg(Bot.uin, segment.image(`file:///${path}`)).catch((err) => {
            logger.error(err)
        })
        // let MsgListTwo=[segment.at(e.user_id),`\n给你点赞喵~\n没点上加我好友发【打卡】~\nhttps://gchat.qpic.cn/gchatpic_new/0/0-0-${Md5}/0`]
        // await e.reply(MsgListTwo)
        await this.setCard(e,NowSum)
        return true
    }
    async GetRough(continuous) {
        let rough = Math.floor(Math.random() * 40 + 120);
        // 当continuous大于3时，每增加1天，原石多增加20
        if (continuous > 3) {
            rough += (continuous - 3) * 20
        }
        return rough
    }
}
