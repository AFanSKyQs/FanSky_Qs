import {getComplaint} from '../models/getString.js'

export class ReplyComplaint extends plugin {
    constructor() {
        super({
            name: '发病回复',
            dsc: '艾特机器人，不要加任何消息，回复发病文',
            event: 'message',
            priority: 666,
            rule: [
                {
                    reg: /.*/i,
                    fnc: 'Complaint'
                }, {
                    reg: /#?(发病|发电|发癫|发疯)/,
                    fnc: 'Complaint'
                },
            ]
        })
    };

    async Complaint(e) {
        if (e.atBot && !e.msg) {
            await this.ReplyComplaint(e)
        } else if (e.msg === '#发病') {
            await this.ReplyComplaint(e)
        } else {
            return false
        }
    }

    async ReplyComplaint(e) {
        let Name = e.sender.nickname || e.sender.card
        let Complaint = await getComplaint()
        let Reply = Complaint.replace(/{target_name}/g, Name)
        await e.reply(Reply)
        return true
    }
}