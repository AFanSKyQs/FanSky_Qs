import plugin from '../../../lib/plugins/plugin.js'
export class FanSkyTest extends plugin {
    constructor() {
        super({
            name: 'FanSkyTest',
            dsc: 'FanSkyTest',
            event: 'message',
            priority: 10,
            rule: [
                {
                    //reg匹配所有信息
                    reg: /^#?(F|f)(T|t)est$/,
                    fnc: 'FanSkyTest',
                }
            ]
        })
    };
    async FanSkyTest(e) {
        e.reply('Test成功,FanSky_Qs插件在线..')
        return true
    }
}