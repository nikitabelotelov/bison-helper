import { WSServer } from '../core/ws/WSServer'
import { ISettings } from './configs/SettingsInterface'
import { RouteContainer } from './RouteContainer'
import { HttpServer } from '../core/http/HttpServer'
import { logger } from '../core/logger/logger'

export class App {
  private readonly httpServer: HttpServer
  private readonly wsServer: WSServer

  public constructor(settings: ISettings) {
    this.httpServer = new HttpServer({ port: settings.websocket.port, host: '0.0.0.0' })
    this.httpServer.start().catch(logger.error)
    this.wsServer = new WSServer(settings.websocket, this.httpServer.getServer().server)

    new RouteContainer(this.wsServer)
  }

  public destroy() {
    return [() => this.wsServer.destroy(), () => this.httpServer.destroy()]
  }
}
