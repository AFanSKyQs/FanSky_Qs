import {getHelpBg} from "../../models/getTuImg.js";
import {getVersionInfo} from "../../models/getVersion.js";

let cwd = process.cwd().replace(/\\/g, '/')

export async function screenData(e) {
    let BotInfo = await getVersionInfo()
    // let BgImgPath=`${cwd}/plugins/FanSky_Qs/resources/help/img/bg`
    let NameList = ['艾尔海森', '八重神子', '迪希雅', '甘雨', '柯莱', '可莉', '流浪者', '纳西妲', '妮露', '赛诺', '提纳里', '夜兰']
    let msg = e.original_msg || e.msg || e.raw_message || "#fan菜单"
    let Data = []
    if (msg.includes("对话") || msg.includes("聊天") || msg.includes("OpenAI") || msg.includes("chatgpt")) {
        Data = await OpenAIHelp(e)
    } else {
        Data = await MainHelpData(e)
    }
    // if (msg.includes("原神") || msg.includes("GenShin") || msg.includes("元神")) {
    //     Data = (await GenshinHelp()).helpData
    // } else if (msg.includes("对话") || msg.includes("聊天") || msg.includes("OpenAI") || msg.includes("chatgpt")) {
    //     Data = (await OpenAIHelp()).helpData
    // } else if (msg.includes("魔晶") || msg.includes("打卡")) {
    //     Data = (await MagicCrystalHelp()).helpData
    // } else if (msg.includes("功能")) {
    //     Data = (await SmallFunctionHelp()).helpData
    // }

    let headImg = (NameList[Math.floor(Math.random() * NameList.length)])
    let AcgPath = await getHelpBg()
    return {
        version: BotInfo.PluginVersion,
        YunzaiName: BotInfo.BotName,
        YunzaiVersion: BotInfo.BotVersion,
        acgBg: AcgPath,
        helpData: Data,
        saveId: e.user_id,
        cwd: cwd,
        tplFile: `${cwd}/plugins/FanSky_Qs/resources/help/help.html`,
        /** 绝对路径 */
        pluResPath: `${cwd}/plugins//FanSky_Qs/resources/help/`,
        headStyle: `<style> .head_box { background: url(${cwd}/plugins/FanSky_Qs/resources/help/img/titleImg/${headImg}.png) #fbe1c0; background-position-x: 42px; background-repeat: no-repeat; background-size: auto 101%; }</style>`
    }
}

export async function MainHelpData(e) {
    let helpData = []
    let OpenStatus = JSON.parse(await redis.get(`FanSky:FunctionOFF`));
    if (OpenStatus.GroupManager === 1) {
        helpData.push({
            "group": "群管系统/设置",
            "list": [{
                "icon": "设置",
                "title": "#fan设置",
                "desc": "查看当前各功能开关"
            },
                {
                    "icon": "设置",
                    "title": "#批量撤回123456/@张三",
                    "desc": "#批量撤回+对象 [非群管仅可对自己操作]"
                }
            ]
        })
    }
    if (OpenStatus.Teyvat === 1) {
        helpData.push({
            "group": "原神系统[非小酋、提瓦特小助手]",
            "list": [
                {
                    "icon": "队伍伤害",
                    "title": "#队伍伤害神鹤万心",
                    "desc": "#队伍伤害uid xx xx xx"
                }
                // ,
                // {
                //     "icon": "队伍伤害",
                //     "title": "#队伍面板",
                //     "desc": "查看已经缓存的角色数据，可直接组合调用队伍伤害"
                // }
                , {
                    "icon": "排行榜",
                    "title": "#宝箱排行",
                    "desc": "官 & B服宝箱排行"
                }, {
                    "icon": "排行榜",
                    "title": "#成就排行",
                    "desc": "官 & B服宝箱排行"
                }, {
                    "icon": "排行榜",
                    "title": "#宝箱排行榜",
                    "desc": "群内宝箱排行榜"
                },
                {
                    "icon": "排行榜",
                    "title": "#成就排行榜",
                    "desc": "群内成就排行榜"
                }
            ]
        })
    }
    if (OpenStatus.MagicCrystal === 1) {
        helpData.push({
            "group": "魔晶系统 [小游戏开发中]",
            "list": [
                {
                    "icon": "最大",
                    "title": "打卡、冒泡",
                    "desc": "记录你的每一天信息"
                }, {
                    "icon": "首次打卡时间",
                    "title": "首次打卡时间",
                    "desc": "你的首次打卡时间"
                }, {
                    "icon": "最大",
                    "title": "emoji猜成语",
                    "desc": "通过emoji猜成语，奖励魔晶"
                }
            ]
        })
    }
    if (OpenStatus.SmallFunction === 1) {
        helpData.push({
            "group": "娱乐系统",
            "list": [
                {
                    "icon": "龙图",
                    "title": "l图 | 龙图 | 加l图 | #更新l图 |有多少l图",
                    "desc": ""
                }, 
                {
                    "icon": "弔图",
                    "title": "d图 | 弔图 | 加d图 | #更新d图 |有多少d图",
                    "desc": ""
                },
                {
                    "icon": "抽象",
                    "title": "抽象帮助 | cxbz",
                    "desc": "将文字转换为多种抽象的东西"
                }, 
                {
                    "icon": "抽象",
                    "title": "抽象xxxx",
                    "desc": "将xxx转换为emoji"
                },
                {
                    "icon": "化学",
                    "title": "化学xxx",
                    "desc": "将xxx转换为化学元素周期表"
                },
                {
                    "icon": "鸡哥",
                    "title": "鸡哥 | 小黑子",
                    "desc": "纯路人表情包"
                },
                {
                    "icon": "丁真",
                    "title": "一眼丁真",
                    "desc": "各种丁真表情包"
                },
                {
                    "icon": "猫眼票房",
                    "title": "电影票房",
                    "desc": "猫眼实时电影票房"
                },
                {
                    "icon": "点赞",
                    "title": "点赞",
                    "desc": "发送卡片并点赞(需要加机器人好友)"
                },
                {
                    "icon": "发病",
                    "title": "发病",
                    "desc": "或艾特机器人不加任何消息 | 对你发病"
                },
            ]
        })
    }
    if (OpenStatus.OpenAI === 1) {
        helpData.push({
            "group": "聊天系统",
            "list": [
                {
                    "icon": "OpenAI",
                    "title": "#fan聊天菜单",
                    "desc": "OpenAI相关模块"
                },
                {
                    "icon": "OpenAI",
                    "title": "OpenAI项过多，已经分离到【#fan聊天菜单】中",
                    "desc": ""
                }
            ]
        })
    }
    if (e.isMaster) {
        helpData.push({
            "group": "其他主人快捷命令",
            "list": [
                {
                    "icon": "github",
                    "title": "#fan设置github开启/关闭",
                    "desc": "开启或关闭更新推送"
                }, {
                    "icon": "sign",
                    "title": "打卡总计",
                    "desc": "今日已经打卡和系统总打卡用户"
                }, {
                    "icon": "点赞",
                    "title": "#开启fan点赞",
                    "desc": "设置点赞功能开启"
                },
            ]
        })
    }
    return helpData
}

export async function OpenAIHelp(e) {
    let helpData = []
    helpData.push({
        "group": "OpenAI菜单：艾特机器人即可开始聊天",
        "list": [
            {
                "icon": "OpenAI",
                "title": "#模型人设列表",
                "desc": "查看目前自带的预设人设"
            }
            , {
                "icon": "OpenAI",
                "title": "#使用模型人设x",
                "desc": "1:猫娘 | 2:辉夜 | 3：病娇 |4：派蒙 | 5:抽象emoji大师 | 6：祖安钢琴师"
            }
            , {
                "icon": "剩余",
                "title": "#key剩余查询",
                "desc": "查询OpenAI的key使用情况"
            },
            // {
            //     "icon": "OpenAI",
            //     "title": "语言模型列表",
            //     "desc": "查看当前已有模型列表"
            // },
            {
                "icon": "重置记忆",
                "title": "#重置对话",
                "desc": "重新开始你的记忆"
            }, {
                "icon": "人设",
                "title": "#设置模型人设xxx",
                "desc": "将OpenAI模型人设设置为xxx[每个人独立]"
            },
        ]
    })
    if (e.isMaster) {
        helpData.push(
            {
                "group": "OpenAI主人菜单",
                "list": [
                    {
                        "icon": "最大",
                        "title": "设置模型打卡开启",
                        "desc": "OpenAI的使用绑定魔晶[开启、关闭]"
                    },
                    {
                        "icon": "OpenAI",
                        "title": "#设置模型代理地址xxx",
                        "desc": "格式：127.0.0.1:7890"
                    }, {
                        "icon": "密钥",
                        "title": "#设置模型key xxx",
                        "desc": "xxx为：sk-xx..."
                    }, {
                        "icon": "OpenAI",
                        "title": "#设置全局人设xxx",
                        "desc": "个人 > 全局 >系统预设"
                    }, {
                        "icon": "OpenAI",
                        "title": "#设置模型模式x",
                        "desc": "1:不记忆 | 2:记忆"
                    }, {
                        "icon": "OpenAI",
                        "title": "#开启群模型123456 | #关闭..",
                        "desc": "开启或关闭群123456的OpenAI功能（默认全开）"
                    }, {
                        "icon": "OpenAI",
                        "title": "#设置模型转合并100",
                        "desc": "设置OpenAI的回复高于多少字数时转合并消息回复(默认100字)"
                    }, {
                        "icon": "开关",
                        "title": "设置OpenAI开启",
                        "desc": "OpenAI总开关[开启、关闭]"
                    }, {
                        "icon": "回收站",
                        "title": "#清空全部",
                        "desc": "清除所有人的对话记录"
                    }, {
                        "icon": "拉黑",
                        "title": "拉黑模型使用[QQ]",
                        "desc": "拉黑某人使用，如：拉黑模型使用3141865879"
                    },
                    // {
                    //     "icon": "OpenAI",
                    //     "title": "更换语言模型1",
                    //     "desc": "更换OpenAI的语言模型[1、2]"
                    // },
                ]
            }
        )
    }
    return helpData
}

export async function MagicCrystalHelp() {
    return {
        helpData: [{
            "group": "【打卡-魔晶系统】[正在开发小游戏]",
            "list": [
                {
                    "icon": "最大",
                    "title": "打卡、冒泡",
                    "desc": "记录你的每一天信息"
                }, {
                    "icon": "首次打卡时间",
                    "title": "首次打卡时间",
                    "desc": "你的首次打卡时间"
                }, {
                    "icon": "最大",
                    "title": "emoji猜成语",
                    "desc": "emoji猜成语，获得魔晶奖励"
                }, {
                    "icon": "sign",
                    "title": "打卡总计",
                    "desc": "统计今日已经打卡和系统总打卡用户"
                },
            ]
        },
        ]
    }
}

export async function GenshinHelp() {
    return {
        helpData: [{
            "group": "原神菜单[数据：非小酋、提瓦特小助手]",
            "list": [
                {
                    "icon": "队伍伤害",
                    "title": "#队伍伤害xx xx...",
                    "desc": "#队伍伤害uid xx xx xx"
                }, {
                    "icon": "队伍伤害",
                    "title": "#队伍面板",
                    "desc": "查看已经缓存的角色数据，可直接组合调用队伍伤害"
                }
                , {
                    "icon": "排行榜",
                    "title": "#宝箱排行",
                    "desc": "官 & B服宝箱排行"
                }, {
                    "icon": "排行榜",
                    "title": "#成就排行",
                    "desc": "官 & B服宝箱排行"
                }, {
                    "icon": "排行榜",
                    "title": "#宝箱排行榜",
                    "desc": "群内宝箱排行榜（需用户通过【#宝箱排行】写入数据）"
                },
                {
                    "icon": "排行榜",
                    "title": "#成就排行榜",
                    "desc": "群内成就排行榜（需用户通过【#成就排行】写入数据）"
                }
            ]
        }
        ]
    }
}

export async function SmallFunctionHelp() {
    return {
        helpData: [
            {
                "group": "主人设置",
                "list": [
                    {
                        "icon": "点赞",
                        "title": "#开启fan点赞",
                        "desc": "设置点赞功能开启"
                    },
                ]
            },
            {
                "group": "单功能菜单",
                "list": [
                    {
                        "icon": "龙图",
                        "title": "l图 | 龙图 | 加l图 | #更新l图 |有多少l图",
                        "desc": ""
                    }, 
                    {
                        "icon": "弔图",
                        "title": "d图 | 弔图 | 加d图 | #更新d图 |有多少d图",
                        "desc": ""
                    },
                    {
                        "icon": "抽象",
                        "title": "抽象帮助 | cxbz",
                        "desc": "将文字转换为多种抽象的东西"
                    }, 
                    {
                        "icon": "抽象",
                        "title": "抽象xxxx",
                        "desc": "将xxx转换为emoji"
                    },
                    {
                        "icon": "化学",
                        "title": "化学xxx",
                        "desc": "将xxx转换为化学元素周期表"
                    },
                    {
                        "icon": "鸡哥",
                        "title": "鸡哥 | 小黑子",
                        "desc": "纯路人表情包"
                    },
                    {
                        "icon": "丁真",
                        "title": "一眼丁真",
                        "desc": "各种丁真表情包"
                    },
                    {
                        "icon": "猫眼票房",
                        "title": "电影票房",
                        "desc": "猫眼实时电影票房"
                    },
                    {
                        "icon": "点赞",
                        "title": "点赞",
                        "desc": "发送卡片并点赞(需要加机器人好友)"
                    },
                    {
                        "icon": "发病",
                        "title": "发病",
                        "desc": "或艾特机器人不加任何消息 | 对你发病"
                    },
                ]
            },
        ]
    }
}