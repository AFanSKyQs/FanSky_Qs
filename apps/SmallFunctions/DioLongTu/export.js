import fs from "fs";
import {promisify} from "util";
import {pipeline} from "stream";
import MD5 from 'md5'
import lodash from 'lodash'
import {segment} from 'oicq'
import {getEmoji} from "../../../models/getString.js";
import fetch from "node-fetch";
import {QQGuildImg} from "../../../models/QQGuildMsg.js";

let MasterQQ = 3141865879 // 接到上传请求时，机器人转发给谁
let imgMaxSize = 5 // 最大上传单张图片大小，单位MB
let Withe = [3141865879] // 可以直接添加的用户QQ，英文逗号分隔
export async function sendTu(e, tuPath, TuName, gitPath) {
    if (!fs.existsSync(tuPath)) {
        logger.info(logger.cyan('[FanSky_Qs]'), logger.yellow(`[DioLongTu]`), logger.red(`[sendTu]`), `已创建${TuName}文件夹`)
        fs.mkdirSync(tuPath)
    }
    let sendPath = await getImgPath(e, tuPath, TuName, gitPath)
    if (sendPath === false) {
        return true
    }
    logger.info(logger.cyan('[FanSky_Qs]'), logger.yellow(`[DioLongTu]`), logger.red(`[sendTu]`), `收到的${TuName}图地址：` + sendPath)
    if(e.guild_id){
        logger.info(logger.cyan("[FanSky_Qs]频道消息[DioLongTu]"))
        await QQGuildImg(e, sendPath)
    }else{
       await e.reply(segment.image(`file:///${sendPath}`))
    }
    return true
}

export async function getTuNum(e, tuPath, TuName, gitPath) {
    if (!fs.existsSync(tuPath)) {
        logger.info(logger.cyan('[FanSky_Qs]'), logger.yellow(`[DioLongTu]`), logger.red(`[getTuNum]`), `已创建${TuName}文件夹`)
        fs.mkdirSync(tuPath)
        if (!fs.existsSync(gitPath)) {
            let emoji = await getEmoji(e)
            e.reply(`暂时还没有${TuName}图哦${emoji}~\n请通过[加${TuName}图]指令来增加\n或通过[#更新${TuName}图]获取云图库`)
            return true
        }
    }
    let totalFileCount
    if (fs.existsSync(gitPath)) {
        let userCount = await countFiles(tuPath);
        let gitCount = await countFiles(gitPath);
        totalFileCount = userCount + gitCount;
        let emoji = await getEmoji(e);
        e.reply(`现在有${totalFileCount}张${TuName}图(云库:${gitCount})${emoji}喵~`);
    } else {
        totalFileCount = await countFiles(tuPath);
        let emoji = await getEmoji(e);
        e.reply(`现在有${totalFileCount}张${TuName}图(云库:0)${emoji}喵~`);
    }
    return true;
}

async function countFiles(tuPath) {
    return new Promise((resolve, reject) => {
        fs.readdir(tuPath, (err, files) => {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                resolve(files.length);
            }
        });
    });
}


export async function addTu(e, tuPath, TuName, gitPath) {
    if (e.isPrivate && !e.isMaster) return true
    if (!Withe.includes(e.user_id) && !e.isMaster) {
        let SendTime = new Date(Date.now()).toLocaleString()
        // let Msg = `群：${e.group_id}\nQQ：${e.user_id}\n时间:${SendTime}`
        let emoji = await getEmoji(e)
        // await Bot.pickFriend(MasterQQ).sendMsg(Msg)
        await redis.set(`FanSky:SmallFunctions:DioLongTu:${new Date(Date.now())}`, JSON.stringify({
            Group: `${e.group_id}`,
            User: `${e.user_id}`,
            type: `${TuName}图`,
            time: `${SendTime}`
        }))
        e.reply(`感谢柠的贡献喵${emoji}~，非主人添加正在完善中~`)
        return true
    }
    if (!fs.existsSync(tuPath)) {
        logger.info(logger.cyan('[FanSky_Qs]'), logger.yellow(`[DioLongTu]`), logger.red(`[addTu]`), `已创建${TuName}文件夹`)
        fs.mkdirSync(tuPath)
    }
    // 保存图片
    let imageMessages = []
    for (let val of e.message) {
        console.log('消息类型1：' + val.type)
        if (val.type === 'image') {
            imageMessages.push(val)
        }
    }
    if (imageMessages.length === 0 && e.source) {
        let source
        if (e.isGroup) {
            // 支持at图片添加，以及支持后发送
            source = (await e.group.getChatHistory(e.source?.seq, 1)).pop()
        } else {
            source = (await e.friend.getChatHistory((e.source?.time + 1), 1)).pop()
        }
        console.log('source:' + source)
        if (source) {
            for (let val of source.message) {
                console.log('消息类型2：' + val.type)
                console.log(val)
                if (val.type === 'image') {
                    imageMessages.push(val)
                } else if (val.type === 'xml' || val.type === 'forward') { // 支持合并转发消息内置的图片批量上传，喵喵 喵喵喵？ 喵喵喵喵
                    // 将合并转发消息转发给Master
                    console.log('消息类型3：' + val.type)
                    console.log(val)
                    console.log(val.data)
                    let resid
                    try {
                        resid = val.data.match(/m_resid="(\d|\w|\/|\+)*"/)[0].replace(/m_resid=|"/g, '')
                    } catch (err) {
                        console.log(err)
                        resid = val.id
                    }
                    if (!resid) break
                    let message = await Bot.getForwardMsg(resid)
                    for (const item of message) {
                        for (const i of item.message) {
                            console.log('消息4：' + i)
                            if (i.type === 'image') {
                                imageMessages.push(i)
                            }
                        }
                    }
                }
            }
        }
    }
    if (imageMessages.length <= 0) {
        let emoji = await getEmoji(e)
        e.reply(`NotFoundQwQ,图片与消息一同发送或回复添加${emoji}..`)
        return true
    }
    await saveImages(e, imageMessages, tuPath, TuName, gitPath)
    return true
}

export async function getImgPath(e, tuPath, TuName, gitPath) {
    async function getImgPaths(folderPath) {
        try {
            const files = await fs.promises.readdir(folderPath)
            return files.map(file => folderPath + '/' + file);
        } catch (err) {
            logger.info(logger.red(err))
            console.error(err);
            return [];
        }
    }

    const tuFiles = await getImgPaths(tuPath);
    const gitFiles = await getImgPaths(gitPath);
    const allFiles = [...tuFiles, ...gitFiles];

    if (allFiles.length === 0) {
        logger.info(logger.cyan('[FanSky_Qs]'), logger.yellow(`[DioLongTu]`), logger.red(`[getImgPath]`), `这个文件夹是空滴~.`);
        let emoji = await getEmoji(e);
        e.reply(`暂时还没有${TuName}图哦${emoji}~\n请通过[加${TuName}图]指令来增加\n或通过[#更新${TuName}图]更新云图库`);
        return false;
    }

    /** 获取未被记录到 redis 中的地址列表*/
    const unselectedFiles = await Promise.all(
        allFiles.map(async (file) => {
            const isFileSelected = await redis.get(`FanSky:SmallFunctions:DLRandomIMG:${TuName}:${file}`);
            return !isFileSelected ? file : null;
        })
    ).then((result) => result.filter((file) => file !== null));

    /** 如果未被记录的地址列表为空，则重置 redis 中的记录，并重新获取未被记录的地址列表 */
    if (unselectedFiles.length === 0) {
        const keys = await redis.keys(`FanSky:SmallFunctions:DLRandomIMG:${TuName}:*`);
        for (const key of keys) {
            await redis.del(key);
        }
        logger.info(logger.cyan('[FanSky_Qs]'), logger.yellow(`[DioLongTu]`), `所有${TuName}图都已看过了，已重置记录。`);
        return await getImgPath(e, tuPath, TuName, gitPath);
    }

    /** 随机选择一个未被记录的地址，并将其记录到 redis 中*/
    const randomIndex = Math.floor(Math.random() * unselectedFiles.length);
    const randomFilePath = unselectedFiles[randomIndex];
    await redis.set(`FanSky:SmallFunctions:DLRandomIMG:${TuName}:${randomFilePath}`, true.toString());

    logger.info(logger.cyan('[FanSky_Qs]'), logger.yellow(`[DioLongTu]`), logger.red(`[getImgPath]`), `得到的地址: ${randomFilePath}`);
    return randomFilePath;
}

export async function saveImages(e, imageMessages, TuPath, TuName, gitPath) {
    let senderName = lodash.truncate(e.sender.card, {length: 8})
    let imgCount = 0
    let urlMap = {}
    for (let val of imageMessages) {
        if (!val.url || urlMap[val.url]) {
            continue
        }
        urlMap[val.url] = true
        const response = await fetch(val.url)
        if (!response.ok) {
            e.reply('图片下载失败。')
            return true
        }
        if (response.headers.get('size') > 1024 * 1024 * imgMaxSize) {
            let emoji = await getEmoji(e)
            e.reply([segment.at(e.user_id, senderName), `添加失败：图片大于${imgMaxSize}MB${emoji}喵~`])
            return true
        }
        let fileName = val.file.substring(0, val.file.lastIndexOf('.'))
        let fileType = val.file.substring(val.file.lastIndexOf('.') + 1)
        if (response.headers.get('content-type') === 'image/gif') {
            fileType = 'gif'
        }
        let imgPath = `${TuPath}/${fileName}.${fileType}`
        const streamPipeline = promisify(pipeline)
        await streamPipeline(response.body, fs.createWriteStream(imgPath))
        let buffers = fs.readFileSync(imgPath)
        let base64 = Buffer.from(buffers, 'base64').toString()
        let md5 = MD5(base64)
        let Md5Path = `${TuPath}/${md5}.${fileType}`
        if (fs.existsSync(Md5Path)) {
            fs.unlink(Md5Path, (err) => {
                console.log('unlink', err)
            })
        }
        fs.rename(imgPath, Md5Path, () => {
        })
        imgCount++
        Bot.logger.mark(`添加成功: ${TuPath}/${fileName}`)
    }
    let TmpName = TuName === '弔' ? 'd' : TuName === '龙' ? 'l' : TuName
    let userCount = await countFiles(TuPath);
    let SumCount = userCount
    let gitCount = 0
    if (fs.existsSync(gitPath)) {
        gitCount = await countFiles(gitPath);
        SumCount += gitCount
    }
    let emoji = await getEmoji(e)
    e.reply([segment.at(e.user_id, senderName), `\n添加了${imgCount}张${TuName}图${emoji}~\n当前共计：${SumCount}(云：${gitCount}张)\n发【${TmpName}图】等同意词可触发`])
    return true
}