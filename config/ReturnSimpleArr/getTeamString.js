import YAML from "yaml"
import fs from "node:fs"

const default_teamPath = `${process.cwd()}/plugins/FanSky_Qs/config/default_SimpleTeamArr.yaml`;
const teamPath = `${process.cwd()}/plugins/FanSky_Qs/config/SimpleTeamArr.yaml`;

export async function ReturnTeamArr(teamName) {
    if (typeof teamName !== 'string') return [];
    let teamlist;
    if (!fs.existsSync(teamPath)) {
      teamlist = YAML.parse(fs.readFileSync(default_teamPath, 'utf8'));
    } else {
      teamlist = YAML.parse(fs.readFileSync(teamPath, 'utf8'));
    }
    let result = [];
    Object.keys(teamlist).forEach(key => {
        if (teamName === key) {
            result = Array.isArray(teamlist[key]) ? teamlist[key] : teamlist[key].chars || [];
        } else if (teamlist[key].alias && teamlist[key].alias.includes(teamName)) {
            result = teamlist[key].chars || [];
        }
    });
    return result;
}