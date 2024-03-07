import fs from 'fs'
import YAML from 'yaml'

const cwd = process.cwd().replace(/\\/g, '/')

class FanCfg {
  constructor () {
    this.plugPath = `${cwd}/plugins/FanSky_Qs`
  }

  getDef (dir, name) {
    return this.getData(`${this.getDir('def')}${dir}/${name}`, 'yaml')
  }

  getFile (path, name, type = 'yaml') {
    path = `${this.getDir(path)}${name}.${type}`
    const data = fs.existsSync(path) ? fs.readFileSync(path, 'utf8') : {}
    return type === 'yaml' ? YAML.parse(data) : JSON.parse(data)
  }

  async getRedis (key) {
    return await redis.exists(key) ? JSON.parse(await redis.get(key)) : {}
  }

  getDir (dir) {
    let path = this.plugPath
    switch (dir) {
      case 'cfg':
        path += '/config/'
        break
      case 'def':
        path += '/config/default/'
        break
      case 'res':
        path += '/resources/'
        break
    }
    return path
  }
}

export default new FanCfg()
