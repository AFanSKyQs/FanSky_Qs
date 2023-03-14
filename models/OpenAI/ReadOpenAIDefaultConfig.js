import fs from "fs";
import {isFileExist} from "../isFileExist.js";


export async function ReadOpenAIDefaultConfig() {
    const fileURL = `${process.cwd()}/plugins/FanSky_Qs/config/OpenAI.json`;
    const defaultURL = `${process.cwd()}/plugins/FanSky_Qs/config/default_config.json`;
    const fileURL_ = fileURL.replace(/\\/g, "/");
    // 检测文件是否存在
    if (!await isFileExist(fileURL_)) {
        fs.copyFileSync(defaultURL, fileURL_);
        logger.info(logger.cyan("首次启动本插件喵~，欢迎使用，已创建OpenAI.json"));
        logger.info(logger.cyan("请在plugins/FanSky_Qs/config/OpenAI.json中填入你的OpenAI密钥即可使用OpenAI功能喵~"));
    }
}
