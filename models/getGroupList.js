export async function getGroup(e){
    let GroupList = await Bot.getGroupList()
    if (!GroupList) {
        e.reply("获取群列表失败！")
        return true
    }
    return Array.from(GroupList.keys())
}
