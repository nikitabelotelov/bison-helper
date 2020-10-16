import fastify, { FastifyInstance } from 'fastify'
import { Server, IncomingMessage, ServerResponse } from 'http'
import { loggerNamespace } from '../logger/logger'
import { Ready } from '../utils/ready'
import { IHttpServerConfig } from './config'

export class HttpServer {
  private readonly logger = loggerNamespace('HttpServer')
  private connected = new Ready()
  private readonly server: FastifyInstance<Server, IncomingMessage, ServerResponse>
  private readonly port: number = 5000
  private readonly address: string = '0.0.0.0'

  constructor(config: IHttpServerConfig) {
    this.server = fastify({})
    this.port = config.port
    this.address = config.host
  }

  public async start(): Promise<void> {
    try {
      await this.server.listen(this.port, this.address)
      this.connected.resolve()
      this.logger.info(`listening on ${this.address}:${this.port}`)
    } catch (err) {
      this.logger.error(err)
      process.exit(1)
    }
  }

  public getServer(): FastifyInstance<Server, IncomingMessage, ServerResponse> {
    return this.server
  }

  public async destroy(): Promise<void> {
    this.logger.info('destroy')
    const server = await this.getServer()
    server.close()
  }
}
