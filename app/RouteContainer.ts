import { WSServer } from '../core/ws/WSServer'
import iohook from 'iohook'
import clipboardy from 'clipboardy'
import { WSResponse } from '../core/ws/WSResponse'

export class RouteContainer {
  public wsServer: WSServer
  public startListen: (req: any) => any = (req) => {
    iohook.on('keypress', (event) => {
      if (event.ctrlKey && (event.keychar === 99 || event.keychar === 1089)) {
        clipboardy.read().then((text) => {
          this.wsServer.broadcast(async () => {
            const response = new WSResponse(
              {
                service: 'helper',
                action: 'copied',
                type: 'event',
              },
              { text }
            )
            return response
          })
        })
      }
    })
    iohook.start()
  }
  public stopListen(req): any {
    iohook.stop()
  }
  public constructor(wsServer: WSServer) {
    this.init(wsServer)
  }

  protected init: (wsServer: WSServer) => any = (wsServer) => {
    this.wsServer = wsServer
    wsServer.onRequest('helper', 'startListen', this.startListen)
    wsServer.onRequest('helper', 'stopListen', this.stopListen)
  }
}
