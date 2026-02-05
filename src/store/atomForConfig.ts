import type { WritableAtom } from 'jotai'
import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import type { RESET } from 'jotai/vanilla/utils/constants'

type SetStateActionWithReset<Value> = Value | typeof RESET | ((prev: Value) => Value | typeof RESET)

export default function atomForConfig<T extends Record<string, unknown>>(
  key: string,
  defaultValue: T,
): WritableAtom<T, [SetStateActionWithReset<T>], void> {
  const storageAtom = atomWithStorage(key, defaultValue)

  return atom((get) => {
    // 1. 获取本地存储的原始对象
    const config = get(storageAtom)

    // 2. 类型检查：如果本地数据不是对象（比如是之前的旧版本字符串），直接返回默认值
    if (typeof config !== 'object' || config === null) {
      return defaultValue
    }

    // 3. 核心修复逻辑：以 defaultValue 为基准进行合并
    let hasChanged = false
    const newConfig = { ...defaultValue }

    for (const prop in defaultValue) {
      if (Object.prototype.hasOwnProperty.call(defaultValue, prop)) {
        if (prop in config) {
          // 如果本地已经有这个属性，保留用户的值
          newConfig[prop as keyof T] = config[prop as keyof T] as any
        } else {
          // 如果本地缺失这个属性（新版本新增），使用默认值并标记需要更新本地存储
          hasChanged = true
        }
      }
    }

    // 检查是否有冗余属性（本地存了但新代码里已经删掉的配置）
    const configKeys = Object.keys(config)
    const defaultKeys = Object.keys(defaultValue)
    if (configKeys.length !== defaultKeys.length || configKeys.some((k) => !(k in defaultValue))) {
      hasChanged = true
    }

    // 4. 如果发现数据结构不一致（补全了新字段或删除了旧字段），同步回 localStorage
    if (hasChanged) {
      const jsonString = JSON.stringify(newConfig)
      localStorage.setItem(key, jsonString)
    }

    return newConfig
  }, storageAtom.write)
}
