import { Central } from '@lionrockjs/central';
import { RouteList } from '@lionrockjs/router';
import RouteAdapter from "../routeAdapter/NodeHTTP.mjs";

import http, { IncomingMessage, ServerResponse } from 'node:http';
import path from 'node:path';
import cookie from 'cookie';
import findMyWay from 'find-my-way';

const router = findMyWay({
  ignoreTrailingSlash: true,
  maxParamLength: 500,
});

export default class ServerAdapterNodeHTTP {
  static searchParamsToObject(entries: IterableIterator<[string, string]>) {
    if(!entries)return {};

    const result: Record<string, string> = {}
    for(const [key, value] of entries) {
      result[key] = value;
    }
    return result;
  }

  //parse form body;
  static async parseBody(incomingMessage: IncomingMessage) {
    return new Promise(resolve => {
      let body = ''
      incomingMessage.on('data', data => {
        body += data
      })
      incomingMessage.on('end', () => {
        resolve(body);
      })
    })
  }

  static async setup() {
    const app = {
      listen: (port: any) => {
        //serve static files
        //if no static file, then router lookup
        const server = http.createServer((req, res)=>{
          router.lookup(req, res);
        });
        server.listen(port);
      },
      route: (it: any) => {
        router.on(it.method, it.url, async (incomingMessage: IncomingMessage, reply: ServerResponse, params: any) =>{
          const req: any = {headers: incomingMessage.headers};

          //parse form body except multipart/form-data
          if(
            incomingMessage.method === 'POST' &&
            !/^multipart\/form-data/.test(incomingMessage.headers['content-type'] || '')
          ){
            req.body = await this.parseBody(incomingMessage);
          }

          const url = new URL(incomingMessage.url || '', `http://${incomingMessage.headers.host}`);
          req.cookies = cookie.parse(incomingMessage.headers.cookie || "", Central.config.cookie?.options || {});
          req.params = params || {};
          req.query = this.searchParamsToObject(url.searchParams.entries());
          req.raw = incomingMessage;
          req.raw.hostname = url.hostname;
          req.url = url.pathname;

          await it.handler(req, reply);
        })
      }
    };

    if(Central.config.system.serve_static_file){
      const {default:serveStatic} = await import('serve-static');

      app.listen = (port: number) =>{
        const server = http.createServer((req, res)=>{
          const serve = serveStatic(path.normalize(Central.APP_PATH + '/../public'), { index: ['index.html', 'index.htm'] });
          serve(req, res, () => {
            router.lookup(req, res);
          });
        });
        server.listen(port);
      }
    }

    //notfound

    RouteList.createRoute(app, RouteAdapter);
    return { listen : (port: any) => app.listen({port})};
  }
}
