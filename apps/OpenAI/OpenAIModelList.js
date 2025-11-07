import getCfg from "../../models/getCfg.js";
let yunPath = process.cwd().replace(/\\/g, '/')
export async function OpenAPModelList(e) {
    let Model_list = (await getCfg(yunPath, 'config')).Model_list
    let Model_list_str = ''
    for (let i = 0; i < Model_list.length; i++) {
        Model_list_str += `${i + 1}、${Model_list[i]}\n`
    }
    e.reply(`模型列表：\n${Model_list_str}\n\n[更换语言模型+数字]切换模型\n目前仅保留了GPT-3.5(最新、稳定)`)
    return true
}
