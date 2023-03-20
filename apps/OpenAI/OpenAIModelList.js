import getCfg from "../../models/getCfg.js";
let yunPath = process.cwd().replace(/\\/g, '/')
export async function OpenAPModelList(e) {
    let Model_list = (await getCfg(yunPath, 'OpenAI')).Model_list
    let Model_list_str = ''
    for (let i = 0; i < Model_list.length; i++) {
        Model_list_str += `${i + 1}、${Model_list[i]}\n`
    }
    e.reply(`模型列表：\n${Model_list_str}\n\n请发送[更换语言模型+数字]来切换模型\n如：更换语言模型1`)
    return true
}