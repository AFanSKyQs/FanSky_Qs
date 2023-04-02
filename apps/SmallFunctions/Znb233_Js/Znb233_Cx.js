import {getPinyin} from "./getPinyin.js";

export async function cxbz(e) {
    await e.reply(`抽象话转换器帮助\n\n\n将xxx转换为抽象话\n抽象xxx（cxxxx）\n\n将xxx还原成拼音\n还抽xxx（hcxxx）\n\n将xxx转为化学元素\n化学xxx（hxxxx）`)
    return true
}

export async function cx(e) {
    let Msg = e.original_msg || e.msg
    let text = Msg.replace(/抽象|#|cx/g, '').trim();
    let msg = await chouxiang(text);
    await e.reply(msg)
    return true
}

export async function hc(e) {
    let Msg = e.original_msg || e.msg
    let text = Msg.replace(/还抽|#|hc/g, '').trim();
    let msg = await dechouxiang(text);
    await e.reply(msg)
    return true
}

export async function hx(e) {
    let Msg = e.original_msg || e.msg
    let text = Msg.replace(/化学|#|hx/g, '').trim();
    let msg = await huaxue(text);
    await e.reply(msg)
    return true
}

const emoji = {
    "chui": "🔨",
    "chuizi": "🔨",
    "xiao": "😄",
    "weixiao": "😊",
    "kaixin": "😃",
    "zhayan": "😉",
    "xihuan": "😍",
    "feiwen": "😘",
    "qin": "😚",
    "tiaopi": "😜",
    "han": "😓",
    "nanguo": "😔",
    "xiaren": "😥",
    "nanshou": "😰",
    "ku": "😭",
    "xiao": "😂",
    "emo": "👿",
    "waixingren": "👽",
    "xindong": "💗",
    "lv": "💚",
    "ai": "❤",
    "xinsui": "💔",
    "xindong": "💓",
    "xing": "✨",
    "xing": "🌟",
    "shengqi": "💢",
    "!": "❕",
    "?": "¿",
    "！": "❕",
    "？": "¿",
    "shuijiao": "💤",
    "fangpi": "💨",
    "di": "💦",
    "shui": "💦",
    "yinyue": "🎶",
    "huo": "🔥",
    "shit": "💩",
    "shi": "💩",
    "dabian": "💩",
    "damuzhi": "👍",
    "bang": "👍",
    "cai": "👎",
    "ok": "👌",
    "quan": "👊",
    "shou": "✊",
    "yeah": "✌",
    "bie": "👋",
    "buxing": "👋",
    "zhang": "✋",
    "ting": "👋",
    "shuangshou": "👐",
    "chuo": "👆",
    "shangmian": "👆",
    "youmian": "👉",
    "zuomian": "👈",
    "shuangshou": "🙌",
    "zhufu": "🙏",
    "baoyou": "🙏",
    "yi": "☝",
    "paishou": "👏",
    "guzhang": "👏",
    "gebo": "💪",
    "li": "💪",
    "zoulu": "🚶",
    "paobu": "🏃",
    "qianshou": "👫",
    "baotou": "🙆",
    "buxing": "🙅",
    "lingguangyixian": "🙇",
    "xianglian": "💏",
    "jianfa": "💇",
    "jiantoufa": "💇",
    "nv": "👧",
    "didi": "👶",
    "xiaohai": "👶",
    "nainai": "👵",
    "yeye": "👴",
    "ye": "👴",
    "baba": "👱",
    "jingcha": "👮",
    "tianshi": "👼",
    "nvwang": "👸",
    "si": "💀",
    "wen": "💋",
    "qinwen": "💋",
    "zui": "👄",
    "zuichun": "👄",
    "er": "👂",
    "bi": "👃",
    "shubao": "🎒",
    "nangua": "🎃",
    "gui": "👻",
    "shengdanshu": "🎄",
    "liwu": "🎁",
    "lingdang": "🔔",
    "gongxi": "🎉",
    "qiqiu": "🎈",
    "guangpan": "💿",
    "guangpan": "📀",
    "xiangji": "📷",
    "shengxiangji": "🎥",
    "diannao": "💻",
    "dianshi": "📺",
    "shouji": "📱",
    "dianhua": "📠",
    "dianhua": "☎",
    "laba": "🔊",
    "laba": "📢",
    "laba": "📣",
    "shouyinji": "📻",
    "leida": "📡",
    "fangda": "🔍",
    "jiesuo": "🔓",
    "suo": "🔒",
    "yaochi": "🔑",
    "jiandao": "✂",
    "dingyin": "🔨",
    "liang": "💡",
    "shouxin": "📩",
    "xinxiang": "📫",
    "paozao": "🛀",
    "cesuo": "🚽",
    "qian": "💰",
    "xiyan": "🚬",
    "zhadan": "💣",
    "qiang": "🔫",
    "yao": "💊",
    "zhen": "💉",
    "ganlanqiu": "🏈",
    "qiu": "🏀",
    "lanqiu": "🏀",
    "zuqiu": "⚽",
    "bangqiu": "⚾",
    "wangqiu": "🎾",
    "ba": "🎱",
    "taiqiu": "🎱",
    "youyong": "🏊",
    "chonglang": "🏄",
    "huaxue": "🎿",
    "heitao": "♠",
    "hongtao": "♥",
    "meihua": "♣",
    "fangpian": "♦",
    "guanjun": "🏆",
    "mingzhong": "🎯",
    "zhong": "🀄",
    "jilu": "📝",
    "shu": "📖",
    "yanse": "🎨",
    "changge": "🎤",
    "tingyinyue": "🎧",
    "jita": "🎸",
    "xiezi": "👟",
    "gaogenxie": "👠",
    "xuezi": "👢",
    "yifu": "👕",
    "qunzi": "👗",
    "hanfu": "👘",
    "bijini": "👙",
    "hudiejie": "🎀",
    "gaomao": "🎩",
    "huangguan": "👑",
    "caomao": "👒",
    "yusan": "🌂",
    "shoutidai": "💼",
    "shoutidai": "👜",
    "kouhong": "💄",
    "jiezhi": "💍",
    "zuanshi": "💎",
    "cha": "☕",
    "pi": "🍺",
    "ganbei": "🍻",
    "chazi": "🍴",
    "hanbaobao": "🍔",
    "shutiao": "🍟",
    "miantiao": "🍝",
    "mifan": "🍚",
    "miantiao": "🍜",
    "mianbao": "🍞",
    "jiandan": "🍳",
    "bingjilin": "🍦",
    "shengdai": "🍧",
    "dangao": "🎂",
    "yikuaidangao": "🍰",
    "pingguo": "🍎",
    "juzi": "🍊",
    "xigua": "🍉",
    "caomei": "🍓",
    "qiezi": "🍆",
    "xihongshi": "🍅",
    "taiyang": "☀",
    "xiayu": "☔",
    "yintian": "☁",
    "xueren": "⛄",
    "yueliang": "🌙",
    "shandian": "⚡",
    "lang": "🌊",
    "miao": "🐱",
    "ao": "🐱",
    "gou": "🐶",
    "shu": "🐭",
    "tuzi": "🐰",
    "qinghua": "🐸",
    "laohu": "🐯",
    "kaola": "🐨",
    "zhu": "🐷",
    "niu": "🐮",
    "zhu": "🐗",
    "hao": "🐵",
    "hou": "🐒",
    "ma": "🐴",
    "ma": "🐎",
    "loutuo": "🐫",
    "yang": "🐑",
    "xiang": "🐘",
    "she": "🐍",
    "niao": "🐦",
    "xiaoji": "🐤",
    "ji": "🐔",
    "chong": "🐛",
    "zhangyu": "🐙",
    "hua": "🌸",
    "meigui": "🌹",
    "xiangrikui": "🌻",
    "fengye": "🍁",
    "xianrenzhang": "🌵",
    "hailuo": "🐚",
    "one": "1⃣",
    "1": "1⃣",
    "yi": "1⃣",
    "two": "2⃣",
    "2": "2⃣",
    "er": "2⃣",
    "three": "3⃣",
    "3": "3⃣",
    "san": "3⃣",
    "four": "4⃣",
    "4": "4⃣",
    "si": "4⃣",
    "five": "5⃣",
    "5": "5⃣",
    "wu": "5⃣",
    "six": "6⃣",
    "6": "6⃣",
    "liu": "6⃣",
    "seven": "7⃣",
    "7": "7⃣",
    "qi": "7⃣",
    "eight": "8⃣",
    "8": "8⃣",
    "ba": "8⃣",
    "nine": "9⃣",
    "9": "9⃣",
    "jiu": "9⃣",
    "ten": "0⃣",
    "0": "0⃣",
    "ling": "0⃣",
    "shang": "⬆",
    "xia": "⬇",
    "zuo": "⬅",
    "you": "➡",
    "youshang": "↗",
    "zuoshang": "↖",
    "youxia": "↘",
    "zuoxia": "↙",
    "houtui": "⏪",
    "qianjin": "⏩",
    "ok": "🆗",
    "new": "🆕",
    "top": "🔝",
    "up": "🆙",
    "xinhao": "📶",
    "man": "🈵",
    "kong": "🈳",
    "de": "🉐",
    "ge": "🈹",
    "zhi": "🈯",
    "gong": "🈺",
    "you": "🈶",
    "wu": "🈚",
    "yue": "🈷",
    "shen": "🈸",
    "wc": "🚾",
    "mi": "㊙",
    "zhu": "㊗",
    "shenfen": "🆔",
    "jiaoliang": "🆚",
    "guanji": "📴",
    "gupiao": "💹",
    "huilv": "💱",
    "a": "🅰",
    "b": "🅱",
    "ab": "🆎",
    "ou": "🅾",
    "hei": "🔲",
    "lingdian": "🕛",
    "yidian": "🕐",
    "erdian": "🕑",
    "sandian": "🕒",
    "sidian": "🕓",
    "wudian": "🕔",
    "liudian": "🕕",
    "qidian": "🕖",
    "badian": "🕗",
    "jiudian": "🕘",
    "shidian": "🕙",
    "shiyidian": "🕚",
    "tema": "™",
    "tama": "™",
    "fangzi": "🏠",
    "yiyuan": "🏥",
    "yinhang": "🏦",
    "jiudian": "🏪",
    "yiyuan": "🏩",
    "yiyuan": "🏨",
    "jiaotang": "💒",
    "qukuanji": "🏧",
    "caihong": "🌈",
    "motianlun": "🎡",
    "guoshanche": "🎢",
    "youlun": "🚢",
    "feiji": "✈",
    "zixingche": "🚲",
    "qiche": "🚙",
    "jiaoche": "🚗",
    "chuzuche": "🚕",
    "gongjiaoche": "🚌",
    "jingche": "🚓",
    "xiaofangche": "🚒",
    "jiuhuche": "🚑",
    "huoche": "🚚",
    "huochezhan": "🚉",
    "gaotie": "🚄",
    "dongche": "🚅",
    "jiayouzhan": "⛽",
    "houlvdeng": "🚥",
    "jinggao": "⚠",
    "java": "♨",
    "riben": "🇯🇵",
    "hanguo": "🇰🇷",
    "zhongguo": "🇨🇳",
    "meiguo": "🇺🇸",
    "mei": "🇺🇸",
    "yingguo": "🇬🇧",
    "na": "🌶",
    "la": "🌶",
    "nan": "♂",
    "nv": "♀",
    "yan": "👁",
    "jiao": "👣",
    "zhuang": "☄",
    "que": "🍆",
    "bu": "🧣",
    "cuo": "👏",
    "tang": "🍬",
    "ban": "🍝",
    "pa": "爪巴",
    "jiang": "🥇",
    "ming": "💗",
    "xin": "💚",
    "feng": "💨",
    "dai": "⛑",
    "tou": "🧑",
    "wo": "🤝",
    "mo": "👻",
    "ri": "🌞",
    "tie": "🛠",
    "dao": "🗾",
    "pao": "🏃‍",
    "zhe": "‍🌤",
    "wei": "‍🥀",
    "peng": "💥‍",
    "mai": "💸‍",
    "pian": "🃏‍",
    "cheng": "🆗‍",
    "zei": "🤑‍",
    "ni": "💪",
    "qing": "🎈‍",
    "lan": "🚫‍",
    "kuai": "🚀",
    "chou": "🤡",
    "kai": "▶‍",
    "che": "🚙‍",
    "kaiche": "‍🔞",
    "shun": "💹‍",
    "hai": "‍🚢",
    "jie": "💳",
    "xiong": "‍🐻",
    "jin": "🏆‍",
    "tu": "🐇‍",
    "gao": "🗻",
    "du": "☠",
    "dui": "✅‍",
    "xian": "➰‍",
    "ren": "👤‍",
    "ha": "🐸‍",
    "bin": "‍🍦",
    "chang": "‍📏",
    "guo": "‍🥘",
    "jia": "‍➕",
    "zai": "‍📥",
    "ya": "‍🦆",
    "chen": "‍🌅",
    "xu": "‍⏭",
    "meng": "‍💭",
    "qu": "‍🎼",
    "xi": "‍🎊",
    "zao": "‍⛏",
    "xizao": "‍🚿",
    "da": "‍🤜😫🤛",
    "hui": "‍🌠",
    "lai": "‍🍼",
    "le": "‍😆",
    "dong": "‍🍩",
    "ben": "‍🤯",
    "gu": "‍🍄",
    "tao": "‍🍑",
    "bao": "‍🐆",
    "lao": "‍👴",
    "po": "‍🎢",
    "shan": "‍🏔",
    "xiao": "😁",
    "xiaoku": "😂",
    "se": "😍",
    "qin": "💋",
    "ku": "😭",
    "yun": "😵",
    "fennu": "👿",
    "shengqi": "👿",
    "nu": "💢",
    "si": "💀",
    "gui": "👻",
    "waixingren": "👽",
    "shi": "💩",
    "nanhai": "👦",
    "gege": "👦",
    "nansheng": "👦",
    "nanren": "👨",
    "nan": "👨",
    "nühai": "👧",
    "nüsheng": "👧",
    "nüren": "👩",
    "nü": "👩",
    "yeye": "👴",
    "ye": "👴",
    "laoren": "👴",
    "laozi": "👴",
    "didi": "👶",
    "jingcha": "👮",
    "gongren": "👷",
    "nongmingong": "👷",
    "tuzi": "👨",
    "shengdan": "🎅",
    "shengdanlaoren": "🎅",
    "zou": "🚶",
    "pao": "🏃",
    "tiaowu": "💃",
    "wu": "💃",
    "jiaren": "👪",
    "qiangzhuang": "💪",
    "qiang": "💪",
    "zhuang": "💪",
    "jirou": "💪",
    "tui": "🦵",
    "jiao": "🦶",
    "zu": "🦶",
    "zhi": "👈",
    "zuo": "⬅",
    "you": "➡",
    "shang": "⬆",
    "xia": "⬇",
    "ye": "✌️",
    "jiandaoshou": "✌️",
    "bixin": "🤞",
    "bixin": "🤞",
    "shouzhang": "🖐️",
    "shou": "🖐️",
    "ok": "👌",
    "haode": "👌",
    "hao": "👍",
    "dian": "dian",
    "dianzan": "dian👍",
    "zan": "👍",
    "bang": "👍",
    "cha": "👎",
    "huai": "👎",
    "quan": "👊",
    "bu": "8️⃣",
    "huishou": "👋",
    "guzhang": "👏",
    "pa": "👏",
    "jushou": "🙌",
    "heshi": "🈴",
    "qidao": "🙏",
    "woshou": "🤝",
    "erduo": "👂",
    "er": "👂",
    "bi": "👃",
    "bizi": "👃",
    "yanjing": "👀",
    "jiaoyin": "👣",
    "zuji": "👣",
    "danao": "🧠",
    "zhi": "🧠",
    "gutou": "🦴",
    "gu": "🦴",
    "yachi": "🦷",
    "chi": "🦷",
    "tian": "👅",
    "zui": "👄",
    "yanjing": "👓",
    "taiyangjing": "🕶️",
    "Txu": "👕",
    "wazi": "🧦",
    "wa": "🧦",
    "qunzi": "👗",
    "qun": "👗",
    "bijini": "👙",
    "nüzhuang": "👚",
    "qianbao": "👛",
    "shoutidai": "👜",
    "bao": "📦",
    "xie": "👞",
    "xiezi": "👞",
    "gaogenxie": "👠",
    "maozi": "🎩",
    "kouhong": "💄",
    "hangli": "🧳",
    "yusan": "☂️",
    "san": "☂️",
    "mengyan": "🙈",
    "kan": "👀",
    "meiyankan": "🙈",
    "buting": "🙉",
    "bushuohua": "🙊",
    "jinyan": "🙊",
    "baozha": "💥",
    "zha": "💥",
    "di": "💦",
    "ben": "💨",
    "benpao": "🏃💨",
    "hou": "🐵",
    "houzi": "🐵",
    "gou": "🐶",
    "mao": "🐱",
    "huanxiong": "🦝",
    "shizi": "🦁",
    "shi": "🦁",
    "ma": "🐴",
    "ma": "🐴",
    "laohu": "🐯",
    "hu": "🐯",
    "banma": "🦓",
    "niu": "🐮",
    "zhu": "🐷",
    "zhubi": "🐽",
    "luotuo": "🐫",
    "tuo": "🐫",
    "zhangjinglu": "🦒",
    "daxiang": "🐘",
    "xiang": "🐘",
    "laoshu": "🐭",
    "shu": "🐭",
    "tuzi": "🐰",
    "tu": "🐰",
    "xiong": "🐻",
    "kaola": "🐨",
    "xiongmao": "🐼",
    "daishu": "🦘",
    "gongji": "🐓",
    "dan": "🥚",
    "niao": "🐦",
    "liao": "🐦",
    "gezi": "🕊️",
    "ge": "🕊️",
    "qie": "🐧",
    "tengxun": "🐧",
    "laoying": "🦅",
    "ying": "🦅",
    "yazi": "🦆",
    "ya": "🦆",
    "tiane": "🦢",
    "yingwu": "🦜",
    "hama": "🐸",
    "ha": "🐸",
    "gui": "🐢",
    "guai": "🐢",
    "she": "🐍",
    "she": "🐍",
    "nongmin": "🐲ming",
    "long": "🐲",
    "jingyu": "🐋",
    "jing": "🐋",
    "haitun": "🐬",
    "tun": "🐬",
    "daiyu": "🐠",
    "pinglun": "🍎🚢",
    "shayu": "🦈",
    "sha": "🦈",
    "zhangyu": "🐙",
    "zhang": "🐙",
    "pangxie": "🦀",
    "xie": "🦀",
    "longxia": "🦞",
    "xia": "🦐",
    "wuzei": "🦑",
    "woniu": "🐌",
    "hudie": "🦋",
    "die": "🦋",
    "chong": "🐛",
    "chongzi": "🐛",
    "mayi": "🐜",
    "yi": "🐜",
    "mifeng": "🐝",
    "feng": "🐝",
    "piaochong": "🐞",
    "piao": "🐞",
    "piao": "🐞",
    "zhizhu": "🕷️",
    "zhu": "🕷️",
    "zhuwang": "🕸️",
    "huaduo": "🌸",
    "xianhua": "🌸",
    "hua": "🌸",
    "meigui": "🌹",
    "xiangrikui": "🌻",
    "shu": "🌲",
    "xianrenzhang": "🌵",
    "siyecao": "🍀",
    "fengye": "🍁",
    "luoye": "🍂",
    "diqiu": "🌏",
    "shijie": "🌏",
    "yueliang": "🌙",
    "yue": "🌙",
    "ri": "☀️",
    "taiyang": "☀️",
    "xing": "⭐",
    "mingxing": "🌟",
    "yun": "☁️",
    "duoyun": "⛅",
    "xiayu": "🌧️",
    "yu": "🌧️",
    "xiaxue": "🌨️",
    "longjuanfeng": "🌪️",
    "wu": "🌫️",
    "caihong": "🌈",
    "shandian": "⚡",
    "gaoyadian": "⚡",
    "dian": "⚡",
    "xuehua": "❄️",
    "xue": "❄️",
    "xueren": "☃️",
    "de": "💧",
    "shui": "💧",
    "huo": "🔥",
    "bolang": "🌊",
    "lang": "🌊",
    "bo": "🌊",
    "shengdanshu": "🎄",
    "shan": "✨",
    "putao": "🍇",
    "xigua": "🍉",
    "gua": "🍉",
    "ningmeng": "🍋",
    "suan": "🍋",
    "xiangjiao": "🍌",
    "jiao": "🍌",
    "boluo": "🍍",
    "fengli": "🍍",
    "pingguo": "🍎",
    "li": "🍐",
    "lizi": "🍐",
    "taozi": "🍑",
    "tao": "🍑",
    "yingtao": "🍒",
    "caomei": "🍓",
    "mihoutao": "🥝",
    "xihongshi": "🍅",
    "qiezi": "🍆",
    "qie": "🍆",
    "tudou": "🥔",
    "fanshu": "🥔",
    "huluobo": "🥕",
    "luobo": "🥕",
    "lajiao": "🌶️",
    "le": "🌶️",
    "na": "🌶️",
    "la": "🌶️",
    "huanggua": "🥒",
    "mogu": "🍄",
    "huasheng": "🥜",
    "mianbao": "🍞",
    "jianbing": "🥞",
    "laobing": "🥞",
    "nailao": "🧀",
    "rou": "🍖",
    "jitui": "🍗",
    "peigen": "🥓",
    "yan": "🧂",
    "baomihua": "🍿",
    "tang": "🥣",
    "jian": "🍳",
    "sanmingzhi": "🥪",
    "regou": "🌭",
    "huotui": "🌭",
    "pisa": "🍕",
    "shutiao": "🍟",
    "hanbao": "🍔",
    "hanbaobao": "🍔",
    "niunai": "🥛",
    "naiping": "🍼",
    "tiantianquan": "🍭",
    "tang": "🍬",
    "qiaokelibang": "🍫",
    "qiaokeli": "🍫",
    "shengridangao": "🎂",
    "dangao": "🎂",
    "quqi": "🍪",
    "bingqilin": "🍦",
    "jiaozi": "🥟",
    "yuebing": "🥮",
    "shousi": "🍣",
    "miantiao": "🍜",
    "mian": "🍜",
    "fan": "🍚",
    "mifan": "🍚",
    "fantuan": "🍙",
    "canju": "🍴",
    "canju": "🍴",
    "shaozi": "🥄",
    "kuaizi": "🥢",
    "kuai": "🥢",
    "ganbei": "🍻",
    "pijiu": "🍺",
    "pi": "🍺",
    "jiu": "🍺",
    "pi": "🍺",
    "bi": "🍺",
    "jiubei": "🍷",
    "feiji": "✈️",
    "chuan": "🚢",
    "honglüdeng": "🚦",
    "jiayou": "⛽",
    "danche": "🚲",
    "zihangche": "🚲",
    "tuolaji": "🚜",
    "che": "🚗",
    "qiche": "🚗",
    "chuzuche": "🚕",
    "jingche": "🚓",
    "xiaofangche": "🚒",
    "jijiuche": "🚑",
    "jiuhuche": "🚑",
    "gongjiaoche": "🚌",
    "gonggongqiche": "🚌",
    "ditie": "🚇",
    "huoche": "🚆",
    "gaotie": "🚄",
    "xuexiao": "🏫",
    "lüguan": "🏨",
    "binguan": "🏨",
    "yinhang": "🏦",
    "yiyuan": "🏥",
    "fangzi": "🏠",
    "jiating": "🏠",
    "haosi": "🏠",
    "budehaosi": "bude🏠",
    "huoshan": "🌋",
    "shan": "⛰️",
    "motuo": "🏍️",
    "motuoche": "🏍️",
    "saiche": "🏎️",
    "shixiang": "🗿",
    "yanhua": "🎆",
    "liuxing": "🌠",
    "feidie": "🛸",
    "huojian": "🚀",
    "renzaoweixing": "🛰️",
    "weixing": "🛰️",
    "zuowei": "💺",
    "pa": "zhaoba",
    "qima": "🏇",
    "huaxue": "⛷️",
    "youyong": "🏊",
    "you": "🏊",
    "daqiu": "⛹️",
    "juzhong": "🏋️",
    "qiche": "🚴",
    "piao": "🎫",
    "xunzhang": "🎖️",
    "jiangbei": "🏆",
    "jiangpai": "🏅",
    "zuqiu": "⚽",
    "bangqiu": "⚾",
    "lanqiu": "🏀",
    "paiqiu": "🏐",
    "ganlanqiu": "🏈",
    "wangqiu": "🎾",
    "baolingqiu": "🎳",
    "pingpangqiu": "🏓",
    "yumaoqiu": "🏸",
    "quanji": "🥊",
    "yugan": "🎣",
    "diaoyu": "🎣",
    "youxi": "🎮",
    "dayouxi": "🎮",
    "touzi": "🎲",
    "sezi": "🎲",
    "huaban": "🎨",
    "hua": "🎨",
    "yishu": "🎨",
    "maoxian": "🧶",
    "huatong": "🎤",
    "erji": "🎧",
    "sakesi": "🎷",
    "jita": "🎸",
    "gangqin": "🎹",
    "laba": "📢",
    "xiaotiqin": "🎻",
    "jianji": "🎬",
    "dianying": "🎬",
    "shejian": "🏹",
    "qingshu": "💌",
    "dong": "🕳️",
    "zhadan": "💣",
    "xizao": "🛀",
    "shuijiao": "🛌",
    "shui": "🛌",
    "dao": "🔪",
    "shijieditu": "🗺",
    "zhinanzhen": "🧭",
    "zhuan": "🧱",
    "you": "🛢",
    "ling": "🛎",
    "xiangling": "🛎",
    "shalou": "⌛",
    "sha": "⌛",
    "biao": "⌚",
    "naozhong": "⏰",
    "zhong": "⏰",
    "wenduji": "🌡",
    "miehuoqi": "🧨",
    "qiqiu": "🎈",
    "gongxi": "🎉",
    "zhuhe": "🎉",
    "ribenren": "🎎",
    "liyuqi": "🎏",
    "hongbao": "🧧",
    "hudiejie": "🎀",
    "jie": "🎀",
    "liwu": "🎁",
    "li": "🎁",
    "shuijingqiu": "🔮",
    "taidixiong": "🧸",
    "xian": "🧵",
    "gouwudai": "🛍",
    "zuanshi": "💎",
    "zuan": "💎",
    "shouyinji": "📻",
    "shouting": "📻",
    "wan": "🍡",
    "tai": "🌞",
    "taiyang": "🌞",
    "shouji": "📱",
    "dianhua": "☎",
    "dianchi": "🔋",
    "chatou": "🔌",
    "diannao": "💻",
    "jianpan": "⌨",
    "dayinji": "🖨",
    "dayin": "🖨",
    "shubiao": "🖱",
    "yingpan": "💽",
    "guangpan": "💿",
    "DVD": "📀",
    "suanpan": "🧮",
    "sheyingji": "🎥",
    "fangying": "📽",
    "shangying": "📽",
    "dianshi": "📺",
    "xiangji": "📷",
    "zhaoxiangji": "📷",
    "luxiangji": "📹",
    "fangdajing": "🔍",
    "fangda": "🔍",
    "lazhu": "🕯",
    "deng": "💡",
    "liang": "💡",
    "shoudiantong": "🔦",
    "bijiben": "📔",
    "ben": "📕",
    "shu": "📕",
    "zi": "📄",
    "ju": "🍊",
    "zhi": "📄",
    "baozhi": "📰",
    "shuqian": "📑",
    "biaoqian": "🏷",
    "qiandai": "💰",
    "riyuan": "💴",
    "meiyuan": "💵",
    "ouyuan": "💶",
    "xinyongka": "💳",
    "shouju": "🧾",
    "xinfeng": "✉",
    "xin": "✉",
    "youjian": "📧",
    "fasong": "📤",
    "jieshou": "📥",
    "shoudao": "📥",
    "youxiang": "📮",
    "qianbi": "✏",
    "gangbi": "🖊",
    "bi": "🖊",
    "huabi": "🖌",
    "labi": "🖍",
    "beiwanglu": "📝",
    "bianqian": "📝",
    "ji": "📝",
    "ji": "🐔",
    "wenjianjia": "📁",
    "rili": "📅",
    "zengzhang": "📈",
    "zengjia": "📈",
    "zengda": "📈",
    "zeng": "📈",
    "xiajiang": "📉",
    "jiangdi": "📉",
    "jianshao": "📉",
    "jiang": "📉",
    "tuding": "📌",
    "huixingzhen": "📎",
    "chizi": "📏",
    "chi": "📏",
    "jian": "✂",
    "lajitong": "🗑",
    "shuo": "🔒",
    "yaoshi": "🔑",
    "bishou": "🗡",
    "shouqiang": "🔫",
    "dunpai": "🛡",
    "xiuli": "🔧",
    "xiu": "🔧",
    "banshou": "🔧",
    "chilun": "⚙",
    "tianping": "⚖",
    "lianjie": "🔗",
    "suolian": "⛓",
    "gongjuxiang": "🧰",
    "cili": "🧲",
    "ci": "🧲",
    "citie": "🧲",
    "shiguan": "🧪",
    "DNA": "🧬",
    "jiyin": "🧬",
    "xianweijing": "🔬",
    "wangyuanjing": "🔭",
    "leida": "📡",
    "zhen": "💉",
    "yao": "💊",
    "yao": "💊",
    "men": "🚪",
    "men": "🚪",
    "chuang": "🛏",
    "cesuo": "🚾",
    "matong": "🚽",
    "linyu": "🚿",
    "yugang": "🛁",
    "xijiejing": "🧴",
    "sao": "🧹",
    "saozhou": "🧹",
    "saoba": "🧹",
    "lanzi": "🧺",
    "juanzhi": "🧻",
    "weishengzhi": "🧻",
    "feizao": "🧼",
    "zao": "🧼",
    "haimian": "🧽",
    "yan": "🚬",
    "xiangyan": "🚬",
    "zhaxin": "💘",
    "xindong": "💓",
    "ai": "💓",
    "xintiao": "💓",
    "xinxinxiangyin": "💕",
    "xinxiangyin": "💕",
    "xinsui": "💔",
    "heixin": "🖤",
    "manfen": "💯",
    "100fen": "💯",
    "xinxi": "💬",
    "xiangfa": "💭",
    "hunshui": "💤",
    "kun": "💤",
    "zheng": "♨",
    "ting": "🛑",
    "xuanfeng": "🌀",
    "jufeng": "🌀",
    "heitao": "♠",
    "hongtao": "♥",
    "fangkuai": "♦",
    "meihua": "♣",
    "pai": "🃏",
    "puke": "🃏",
    "zhong": "🀄",
    "hongzhong": "🀄",
    "jingyin": "🔇",
    "yinliang": "🔈",
    "lingcheng": "🔔",
    "yinle": "🎵",
    "yin": "🎵",
    "ATM": "🏧",
    "lunyi": "♿",
    "canjiren": "♿",
    "nance": "🚹",
    "nüce": "🚺",
    "yinger": "🚼",
    "jinggao": "⚠",
    "jinzhijinru": "⛔",
    "jinzhi": "🚫",
    "chengren": "🔞",
    "seqing": "🔞",
    "fushe": "☢",
    "shangxia": "↕",
    "zuoyou": "↔",
    "xunhuan": "🔄",
    "raoquan": "🔄",
    "rao": "🔄",
    "fanhui": "🔙",
    "yuanzi": "⚛",
    "yinyang": "☯",
    "qingzhen": "☪",
    "yisilan": "☪",
    "musilin": "☪",
    "baiyangzuo": "♈",
    "jinniuzuo": "♉",
    "shuangzizuo": "♊",
    "juxiezuo": "♋",
    "shizizuo": "♌",
    "chunüzuo": "♍",
    "tianchengzuo": "♎",
    "tianxiezuo": "♏",
    "sheshouzuo": "♐",
    "mojiezuo": "♑",
    "shuipingzuo": "♒",
    "shuangyuzuo": "♓",
    "shefuzuo": "⛎",
    "zhongfang": "🔁",
    "danquxunhuan": "🔂",
    "bofang": "▶",
    "kuaijin": "⏩",
    "fanhuijian": "◀",
    "kuaitui": "⏪",
    "zanting": "⏹",
    "tuichu": "⏏",
    "dianyingyuan": "🎦",
    "xinhao": "📶",
    "wuqiong": "♾",
    "wuxian": "♾",
    "huishou": "♻",
    "sanchaji": "🔱",
    "huan": "⭕",
    "quan": "⭕",
    "yuan": "⭕",
    "dui": "✅",
    "cuo": "❌",
    "bisi": "biss",
    "gaokuaidian": "GKD",
    "jia": "➕",
    "jian": "➖",
    "chu": "➗",
    "?": "¿",
    "!": "❗",
    "jing": "",
    "0": "0️⃣",
    "1": "1️⃣",
    "2": "2️⃣",
    "3": "3️⃣",
    "4": "4️⃣",
    "5": "5️⃣",
    "6": "6️⃣",
    "7": "7️⃣",
    "8": "8️⃣",
    "nin": "ning",
    "9": "9️⃣",
    "10": "🔟",
    "ku": "🆒",
    "mianfei": "🆓",
    "xin": "🆕",
    "yue": "🈷",
    "you": "🈶",
    "de": "🉐",
    "ge": "🈹",
    "wu": "🈚",
    "jin": "🈲",
    "ke": "🉑",
    "shen": "🈸",
    "kong": "🈳",
    "zhu": "㊗",
    "mi": "㊙",
    "man": "🈵",
    "ling": "0️⃣",
    "yi": "1️⃣",
    "er": "2️⃣",
    "san": "3️⃣",
    "si": "4️⃣",
    "fu": "fo",
    "wu": "5️⃣",
    "liu": "6️⃣",
    "qi": "7️⃣",
    "ba": "8️⃣",
    "jiu": "9️⃣",
    "shi": "🔟",
    "？": "¿",
    "o": "⭕",
    "ya": "🦆",
    "asensongdao": "🇦🇨",
    "andaoer": "🇦🇩",
    "alianqiu": "🇦🇪",
    "afuhan": "🇦🇫",
    "antiguahebabuda": "🇦🇬",
    "anguila": "🇦🇮",
    "aerbaniya": "🇦🇱",
    "yameiniya": "🇦🇲",
    "angela": "🇦🇴",
    "nanjizhou": "🇦🇶",
    "agenting": "🇦🇷",
    "meishusamoyaqundao": "🇦🇸",
    "aodili": "🇦🇹",
    "aodaliya": "🇦🇺",
    "aluba": "🇦🇼",
    "aolanqundao": "🇦🇽",
    "asaibaijiang": "🇦🇿",
    "bohei": "🇧🇦",
    "baduosi": "🇧🇧",
    "mengjialaguo": "🇧🇩",
    "weibilishi": "🇧🇪",
    "bujinafasuo": "🇧🇫",
    "baojialiya": "🇧🇬",
    "balin": "🇧🇭",
    "bulongdi": "🇧🇮",
    "beining": "🇧🇯",
    "shengbatailemi": "🇧🇱",
    "baimuda": "🇧🇲",
    "wenlai": "🇧🇳",
    "boliweiya": "🇧🇴",
    "helanjialebi": "🇧🇶",
    "baxi": "🇧🇷",
    "bahama": "🇧🇸",
    "budan": "🇧🇹",
    "buweidao": "🇧🇻",
    "bociwana": "🇧🇼",
    "baieluosi": "🇧🇾",
    "bolizi": "🇧🇿",
    "jianada": "🇨🇦",
    "kekesiqundao": "🇨🇨",
    "gangguojin": "🇨🇩",
    "zhongfeigongheguo": "🇨🇫",
    "gangguobu": "🇨🇬",
    "ruishi": "🇨🇭",
    "ketediwa": "🇨🇮",
    "kukequndao": "🇨🇰",
    "zhili": "🇨🇱",
    "kamailong": "🇨🇲",
    "zhongguo": "🇨🇳",
    "gelunbiya": "🇨🇴",
    "kelipodundao": "🇨🇵",
    "gesidalijia": "🇨🇷",
    "guba": "🇨🇺",
    "fodejiao": "🇨🇻",
    "kulasuo": "🇨🇼",
    "shengdandao": "🇨🇽",
    "saipulusi": "🇨🇾",
    "jiekegongheguo": "🇨🇿",
    "deguo": "🇩🇪",
    "digejiaxiya": "🇩🇬",
    "jibuti": "🇩🇯",
    "danmai": "🇩🇰",
    "duominijia": "🇩🇲",
    "duomingnijiagongheguo": "🇩🇴",
    "aerjiliya": "🇩🇿",
    "xiudahemeililiya": "🇪🇦",
    "eguaduoer": "🇪🇨",
    "aishaniya": "🇪🇪",
    "aiji": "🇪🇬",
    "xisahala": "🇪🇭",
    "eliteliya": "🇪🇷",
    "xibanya": "🇪🇸",
    "aisaiebiya": "🇪🇹",
    "oumeng": "🇪🇺",
    "fenlan": "🇫🇮",
    "feiji": "🇫🇯",
    "fukelanqundao": "🇫🇰",
    "mikeluonixiya": "🇫🇲",
    "faluoqundao": "🇫🇴",
    "faguo": "🇫🇷",
    "jiapeng": "🇬🇦",
    "yingguo": "🇬🇧",
    "gelinnada": "🇬🇩",
    "gelujiya": "🇬🇪",
    "fashuguiyana": "🇬🇫",
    "genxidao": "🇬🇬",
    "jiana": "🇬🇭",
    "zhibuluotuo": "🇬🇮",
    "gelinglan": "🇬🇱",
    "gangbiya": "🇬🇲",
    "jineiya": "🇬🇳",
    "guadeluopudao": "🇬🇵",
    "chidaojineiya": "🇬🇶",
    "xila": "🇬🇷",
    "nanqiaozhiyadaohenansangweiqiqundao": "🇬🇸",
    "weidimala": "🇬🇹",
    "guandao": "🇬🇺",
    "jineiyabishao": "🇬🇼",
    "guiyana": "🇬🇾",
    "xianggang": "🇭🇰",
    "hedeyumaiketangnaqundao": "🇭🇲",
    "hongdoulasi": "🇭🇳",
    "keluodiya": "🇭🇷",
    "haidi": "🇭🇹",
    "xiongyali": "🇭🇺",
    "jianaliqundao": "🇮🇨",
    "yinni": "🇮🇩",
    "aierlan": "🇮🇪",
    "weiyiselie": "🇮🇱",
    "mandao": "🇮🇲",
    "yindu": "🇮🇳",
    "yingshuyinduyanglingdi": "🇮🇴",
    "yilake": "🇮🇶",
    "yilang": "🇮🇷",
    "bingdao": "🇮🇸",
    "yidali": "🇮🇹",
    "zexi": "🇯🇪",
    "yamaijia": "🇯🇲",
    "yuedan": "🇯🇴",
    "riben": "🇯🇵",
    "kenniya": "🇰🇪",
    "jierjisisitan": "🇰🇬",
    "jianpuzhai": "🇰🇭",
    "jilibasi": "🇰🇮",
    "kemoluo": "🇰🇲",
    "shengjiciheniweisi": "🇰🇳",
    "chaoxian": "🇰🇵",
    "hanguo": "🇰🇷",
    "keweite": "🇰🇼",
    "kaimanqundao": "🇰🇾",
    "hasakesitan": "🇰🇿",
    "laowo": "🇱🇦",
    "libanen": "🇱🇧",
    "shengluxiya": "🇱🇨",
    "liezhidunshideng": "🇱🇮",
    "sililanka": "🇱🇰",
    "libiliya": "🇱🇷",
    "laisuotuo": "🇱🇸",
    "litaowan": "🇱🇹",
    "lusenbao": "🇱🇺",
    "latuoweiya": "🇱🇻",
    "libiya": "🇱🇾",
    "moluoge": "🇲🇦",
    "monage": "🇲🇨",
    "moerduowa": "🇲🇩",
    "heishan": "🇲🇪",
    "shengmading": "🇲🇫",
    "madajiasijia": "🇲🇬",
    "mashaoerqundao": "🇲🇭",
    "maqidun": "🇲🇰",
    "mali": "🇲🇱",
    "miandian": "🇲🇲",
    "menggu": "🇲🇳",
    "aomen": "🇲🇴",
    "beimaliyanaqundao": "🇲🇵",
    "matinikedao": "🇲🇶",
    "maolitaniya": "🇲🇷",
    "mengtesailate": "🇲🇸",
    "maerta": "🇲🇹",
    "maoliqiusi": "🇲🇺",
    "maerdaifu": "🇲🇻",
    "malawei": "🇲🇼",
    "moxige": "🇲🇽",
    "malaixiya": "🇲🇾",
    "mosangbike": "🇲🇿",
    "namibiya": "🇳🇦",
    "xinkaliduoniya": "🇳🇨",
    "nirier": "🇳🇪",
    "nuofukedao": "🇳🇫",
    "niriliya": "🇳🇬",
    "nijialagua": "🇳🇮",
    "helan": "🇳🇱",
    "nuowei": "🇳🇴",
    "niboer": "🇳🇵",
    "naolu": "🇳🇷",
    "niuai": "🇳🇺",
    "xinxilan": "🇳🇿",
    "aman": "🇴🇲",
    "banama": "🇵🇦",
    "milu": "🇵🇪",
    "fashubolinixiya": "🇵🇫",
    "babuyaxinjineiya": "🇵🇬",
    "feilübin": "🇵🇭",
    "bajisitan": "🇵🇰",
    "bolan": "🇵🇱",
    "shengpiaierhemikelongqundao": "🇵🇲",
    "pitekaienqundao": "🇵🇳",
    "boduolige": "🇵🇷",
    "balesitanlingtu": "🇵🇸",
    "putaoya": "🇵🇹",
    "palao": "🇵🇼",
    "balagui": "🇵🇾",
    "kataer": "🇶🇦",
    "tuanyuan": "🇷🇪",
    "luomaniya": "🇷🇴",
    "saierweiya": "🇷🇸",
    "eluosi": "🇷🇺",
    "luwangda": "🇷🇼",
    "shatealabo": "🇸🇦",
    "suoluomenqundao": "🇸🇧",
    "saisheer": "🇸🇨",
    "sudan": "🇸🇩",
    "ruidian": "🇸🇪",
    "xinjiapo": "🇸🇬",
    "shenghelena": "🇸🇭",
    "siluowenniya": "🇸🇮",
    "siwaerbaqundaoheyangmayan": "🇸🇯",
    "siluofake": "🇸🇰",
    "sailaliang": "🇸🇱",
    "shengmalinuo": "🇸🇲",
    "saineijiaer": "🇸🇳",
    "suomali": "🇸🇴",
    "sulinan": "🇸🇷",
    "nansudan": "🇸🇸",
    "shengduomeihepulinxibi": "🇸🇹",
    "saerwaduo": "🇸🇻",
    "shengmadingdao": "🇸🇽",
    "xuliya": "🇸🇾",
    "siweishilan": "🇸🇿",
    "telisitandakuniyaqundao": "🇹🇦",
    "tekesihekaikesiqundao": "🇹🇨",
    "zhade": "🇹🇩",
    "faguonanfangdelingtu": "🇹🇫",
    "duoge": "🇹🇬",
    "taiguo": "🇹🇭",
    "tajikesitan": "🇹🇯",
    "tuokelao": "🇹🇰",
    "dongdiwen": "🇹🇱",
    "tukumansitan": "🇹🇲",
    "tunisi": "🇹🇳",
    "tangjia": "🇹🇴",
    "tuerqi": "🇹🇷",
    "telinidaheduobage": "🇹🇹",
    "tuwalu": "🇹🇻",
    "taiwan": "🇹🇼",
    "tansangniya": "🇹🇿",
    "wukelan": "🇺🇦",
    "wuganda": "🇺🇬",
    "meiguolidao": "🇺🇲",
    "meiguo": "🇺🇸",
    "wulagui": "🇺🇾",
    "wuzibiekesitan": "🇺🇿",
    "fandigangcheng": "🇻🇦",
    "shengwensentehegelinnadingsi": "🇻🇨",
    "weineiruila": "🇻🇪",
    "yingshuweierjingqundao": "🇻🇬",
    "meishuweierjingqundao": "🇻🇮",
    "yuenan": "🇻🇳",
    "wanuatu": "🇻🇺",
    "walisihefutunaqundao": "🇼🇫",
    "samoya": "🇼🇸",
    "kesuowo": "🇽🇰",
    "yemen": "🇾🇪",
    "mayuete": "🇾🇹",
    "nanfei": "🇿🇦",
    "zanbiya": "🇿🇲",
    "jinbabuwei": "🇿🇼",
    "nei": "👙",
    "liupi": "🐮🍺",
    "hang": "⭐",
    "nige": "👨🏿",
    "heiren": "👨🏿",
    "yinghua": "🌸",
    "nai": "🍼",
    "han": "🍔",
    "haihang": "🌊⭐",
    "xiaren": "🍤",
    "sharen": "🍤",
    "qian": "💰",
    "feiwu": "five",
    "qiu": "⚽",
    "tu": "🤮",
    "tou": "🌿",
    "cao": "🌿",
    "fu": "🪓",
    "ping": "🍎",
    "tounima": "tony🐎",
    "wenzi": "🦟",
    "ding": "🦟"
};
const elementsP = {
    "qing": "氢",
    "qin": "氢",
    "hai": "氦",
    "li": "锂",
    "ni": "锂",
    "pi": "铍",
    "peng": "硼",
    "tan": "钽",
    "dan": "氮",
    "yang": "氧",
    "fu": "氟",
    "nai": "氖",
    "na": "钠",
    "mei": "镁",
    "lv": "氯",
    "gui": "硅",
    "lin": "磷",
    "liu": "硫",
    "ya": "氩",
    "jia": "镓",
    "gai": "钙",
    "kang": "钪",
    "tai": "钛",
    "fan": "钒",
    "ge": "鿔",
    "meng": "锰",
    "tie": "铁",
    "gu": "钴",
    "nie": "镍",
    "tong": "铜",
    "xin": "锌",
    "zhe": "锗",
    "shen": "砷",
    "xi": "锡",
    "xiu": "溴",
    "ke": "氪",
    "ru": "铷",
    "si": "锶",
    "yi": "铱",
    "gao": "锆",
    "ni": "铌",
    "mu": "钼",
    "de": "锝",
    "liao": "钌",
    "lao": "铹",
    "ba": "钯",
    "yin": "铟",
    "ti": "锑",
    "di": "镝",
    "dian": "碘",
    "xian": "氙",
    "se": "铯",
    "bei": "钡",
    "lan": "镧",
    "shi": "铈",
    "pu": "镤",
    "nv": "钕",
    "po": "钋",
    "shan": "钐",
    "you": "铀",
    "ga": "钆",
    "te": "铽",
    "huo": "钬",
    "er": "铒",
    "diu": "铥",
    "lu": "镥",
    "ha": "铪",
    "wu": "钨",
    "lai": " 铼",
    "e": "锇",
    "bo": "铂",
    "jin": "金",
    "gong": "汞",
    "ta": "铊",
    "qian": "铅",
    "bi": "铋",
    "ai": "锿",
    "dong": "氡",
    "fang": "钫",
    "lei": "镭",
    "a": "锕",
    "tu": "钍",
    "bu": "钚",
    "ju": "锔",
    "pei": "锫",
    "kai": "锎",
    "fei": "镄",
    "men": "钔",
    "nuo": "锘",
    "lu": "𬬻",
    "du": "𬭊",
    "xi": "𬭳",
    "hei": "𬭶",
    "lun": "𬬭",
    "mo": "镆",
    "li": "𫟷"
};

async function chouxiang(s) {
    var h = [];
    for (let v of s) {
        h.push(v)
    }
    var cxresult = "";
    for (let index = 0; index < h.length; index++) {
        if (index < h.length && emoji[await getPinyin(h[index]) + await getPinyin(h[index + 1])] !== undefined) {
            cxresult += emoji[await getPinyin(h[index]) + await getPinyin(h[index + 1])];
            index++
        } else if (emoji[await getPinyin(h[index])] !== undefined) {
            cxresult += emoji[await getPinyin(h[index])]
        } else {
            cxresult += h[index]
        }
    }
    return cxresult
}

function rawPinyin(s) {
    console.log(s);
    var sr = [];
    for (var index in emoji) {
        if (emoji[index] === s) {
            console.log(index);
            sr.push(index)
        }
    }
    if (sr.length > 0) return sr.join("/")
    else return s
}

async function dechouxiang(s) {
    const h = s.split('');
    const cxresult = h.map(function (char) {
        return rawPinyin(char);
    });
    return cxresult.join('-');
}

async function huaxue(s) {
    var h = [];
    for (let v of s) {
        h.push(v)
    }
    var cxresult = "";
    for (let index = 0; index < h.length; index++) {
        if (index < h.length && elementsP[await getPinyin(h[index]) + await getPinyin(h[index + 1])] !== undefined) {
            cxresult += elementsP[await getPinyin(h[index]) + await getPinyin(h[index + 1])];
            index++
        } else if (elementsP[await getPinyin(h[index])] !== undefined) {
            cxresult += elementsP[await getPinyin(h[index])]
        } else {
            cxresult += h[index]
        }
    }
    return cxresult
}