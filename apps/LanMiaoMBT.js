export class LanMiaoMBT extends plugin {
    constructor() {
        super({
            name: '拦截喵喵面板图列表',
            dsc: '不让非管理员触发面板图列表',
            event: 'message',
            // 优先级(数值越小优先度越高)
            priority: 1,
            // 消息匹配规则
            rule: [
                {
                    reg: '面板图列表',
                    fnc: 'LanMiaoMBT'
                }
            ]
        })
    };
        async LanMiaoMBT(e) {
            return !e.isMaster;
    }
}