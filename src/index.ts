import * as fs from 'fs'
import * as path from 'path'
import { diffString } from 'json-diff'
import fetch from 'minipass-fetch'

const read = (name: string) => fs.readFileSync(name, 'utf8')
const readJson = (name: string) => JSON.parse(read(name))
const write = (name: string, data: string) => {
  fs.mkdirSync(path.dirname(name), { recursive: true })
  fs.writeFileSync(name, data, 'utf8')
}
const writeJson = (name: string, data: any) => write(name, JSON.stringify(data, null, 2) + '\n')
const copy = (data: any) => JSON.parse(JSON.stringify(data))
const sort = (data: any) => {
  const sorted = Object.fromEntries(
    Object.entries(data).sort(([a]: any, [b]: any) => (a > b ? 1 : -1))
  )
  for (const key in data) delete data[key]
  Object.assign(data, sorted)
  return data
}

export const pullConfigs = (remote: string, local: string) => {
  const assign = Object.assign

  const omit = (obj: Record<string, any>, keys: string[]): Record<string, any> => {
    const result = Object.assign({}, obj)
    for (const key of keys) delete result[key]
    return result
  }

  const pick = (obj: Record<string, any>, keys: string[]): Record<string, any> => {
    const result: Record<string, any> = {}
    for (const key of keys) result[key] = obj[key]
    return result
  }

  const fail = (file: string, res: Response) => {
    console.log('failed:', file, res.status, res.statusText)
  }

  const merge = async (file: string, replacer?: (prev: any, next: any) => void) => {
    const res = await fetch(remote + file)
    if (!res.ok) return fail(file, res)

    const next = (await res.json()) as any

    let prev = {}
    try {
      prev = readJson(local + file)
    } catch {
      //
    }
    const old = copy(prev)

    if (replacer) {
      replacer(prev, next)
    } else {
      assign(prev, next)
    }

    const diff = diffString(old, prev)
    if (diff.length) {
      console.log('merging:', file)
      console.log(diff)
      writeJson(local + file, prev)
    }
  }

  const replace = async (file: string) => {
    const res = await fetch(remote + file)
    if (!res.ok) return fail(file, res)

    const next = await res.text()
    let msg = 'replacing:'
    let prev = ''
    try {
      prev = read(local + file)
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        msg = 'adding:'
      }
    }
    if (prev !== next) {
      console.log(msg, file)
      write(local + file, next)
    }
  }

  return { assign, omit, pick, sort, merge, replace }
}

export default pullConfigs
