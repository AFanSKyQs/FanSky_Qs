import fs from "fs";
let cwd = process.cwd().replace(/\\/g, "/")
const getCfg = function(yunPath,getName){
    const fileURL = `${yunPath}/plugins/FanSky_Qs/config/${getName}.json`;
    const fileURL_ = fileURL.replace(/\\/g, "/");
    const fileContents = fs.readFileSync(fileURL_, 'utf8');
    return JSON.parse(fileContents);
};
export async function getOpenAIConfig() {
    // 统一使用 config.json
    const fileURL = `${cwd}/plugins/FanSky_Qs/config/config.json`;
    if (!fs.existsSync(fileURL)) {
        return {error: "配置文件不存在"}
    }
    const fileContents = fs.readFileSync(fileURL, 'utf8');
    return JSON.parse(fileContents);
}
export default getCfg;

// 已弃用方法：yaml
// import fs from "fs";
// import yaml from "yaml";
//
// let path_ = `${process.cwd()}/plugins/FanSky_Qs/config/config`
// let path=`E:/Bot_V3/yunzai/Yunzai-Bot/plugins/FanSky_Qs/config/config`
// /** 读取配置文件标 */
// async function getCfg(toPath) {
//     let __path = path + `/${toPath}.yaml`
//     __path = __path.replace(/\\/g, "/")
//     function getCfgPromise() {
//         return new Promise(async (resolve, reject) => {
//             try {
//                 const file = await fs.promises.readFile(__path, "utf8");
//                 const config = yaml.parse(file);
//                 resolve(config)
//             } catch (err) {
//                 console.error(err);
//                 reject(err)
//             }
//         })
//     }
//
//     return getCfgPromise().then((config) => {
//         return config
//     }).catch((err) => {
//         console.log(err)
//     })
// }
// async function setCfg(toPath,SetKey,Value) {
//     let __path = path + `/${toPath}.yaml`
//     __path = __path.replace(/\\/g, "/")
//
//     function setCfgPromise() {
//         return new Promise(async (resolve, reject) => {
//             try {
//                 const file = await fs.promises.writeFile(__path, yaml, "utf8");
//                 resolve(file)
//             } catch (err) {
//                 console.error(err);
//                 reject(err)
//             }
//         })
//     }
//
//     return setCfgPromise().then((config) => {
//         return config
//     }).catch((err) => {
//         console.log(err)
//     })
// }
// let cfg=getCfg("testYaml")
// // let cfg=await setCfg("testYaml","testQQ",123456)
// console.log(cfg)
// export default {getCfg, setCfg}
