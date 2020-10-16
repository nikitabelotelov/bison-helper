import axios, { AxiosInstance, AxiosRequestConfig, Canceler, Method } from 'axios'
import * as fs from 'fs-extra'
import { RequestCancel } from './RequestCancel'
import { logger } from '../../logger/logger'

axios.defaults.withCredentials = true

export class HttpClient {
  private readonly client: AxiosInstance
  private readonly extendedConfig?: AxiosRequestConfig
  private headers: Record<string, any> = {}

  public constructor(extendedConfig?: AxiosRequestConfig) {
    this.extendedConfig = extendedConfig
    this.client = axios.create()
    this.setHeaders({
      'Content-Type': 'application/json; charset=UTF-8',
    })
  }

  public get(url: string, payload: Record<string, any> = {}, cancelObject?: RequestCancel) {
    return this.do('GET', url, payload, cancelObject)
  }

  public post(url: string, payload: Record<string, any> = {}, cancelObject?: RequestCancel) {
    return this.do('POST', url, payload, cancelObject)
  }

  public put(url: string, payload: Record<string, any> = {}, cancelObject?: RequestCancel) {
    return this.do('PUT', url, payload, cancelObject)
  }

  public patch(url: string, payload: Record<string, any> = {}, cancelObject?: RequestCancel) {
    return this.do('PATCH', url, payload, cancelObject)
  }

  public delete(url: string, payload: Record<string, any> = {}, cancelObject?: RequestCancel) {
    return this.do('DELETE', url, payload, cancelObject)
  }

  public async download(url: string, destination: string, payload: Record<string, any> = {}, cancelObject?: RequestCancel) {
    const config: AxiosRequestConfig = {
      url,
      method: 'GET',
      responseType: 'stream',
      headers: this.headers,
      params: payload,
      cancelToken: this.cancelToken(cancelObject),
    }

    const writer = fs.createWriteStream(destination)
    const response = await this.client({ ...config, ...this.extendedConfig })
    response.data.pipe(writer)

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve)
      writer.on('error', reject)
    })
  }

  public setHeaders(headers: Record<string, any>) {
    this.headers = headers
  }

  protected async do(method: Method, url: string, payload: Record<string, any>, cancelObject?: RequestCancel): Promise<Record<string, any>> {
    const config: AxiosRequestConfig = {
      method,
      url,
      headers: this.headers,
      params: {},
      data: {},
      cancelToken: this.cancelToken(cancelObject),
    }

    if (method === 'GET') {
      config.params = payload
    } else {
      config.data = payload
    }

    try {
      const { data } = await this.client({ ...config, ...this.extendedConfig })
      return data || {}
    } catch (error) {
      const message = error.response && error.response.data && error.response.data.message ? error.response.data.message : null
      logger.error(message || error)
      error.serverMessage = message
      throw error
    }
  }

  protected cancelToken(cancelObject?: RequestCancel) {
    return new axios.CancelToken((c: Canceler) => {
      if (cancelObject) {
        cancelObject.setCancelFunction(c)
      }
    })
  }
}
