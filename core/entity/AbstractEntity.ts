import { logger } from '../logger/logger'

export abstract class AbstractEntity<TypeData extends Record<string, any>> {
  public id: any = null

  public setData(data: TypeData) {
    const properties: any = []
    if (data) {
      for (const key in data) {
        if (data.hasOwnProperty(key) && this.hasOwnProperty(key)) {
          const value = data[key]
          if (typeof value !== 'function') {
            properties[key] = data[key]
          }
        }
      }
    }

    Object.assign(this, properties)
  }

  public getData(): TypeData {
    const data: any = {}
    for (const key in this) {
      if (this.hasOwnProperty(key)) {
        data[key] = this[key]
      }
    }

    return data
  }

  /**
   * @throws TypeError
   * @param data
   */
  public static cast(data: Record<string, any>) {
    logger.error('Should be override for casting data', data)
    throw new Error('Should be override')
  }
}
