import { Central, RouteList } from '@lionrockjs/central';
import RouteAdapter from "../routeAdapter/NodeHTTP.mjs";

import http from 'node:http';
import cookie from 'cookie';
import serveStatic from 'serve-static';
import path from 'node:path';
import findMyWay from 'find-my-way';
const router = findMyWay({
  ignoreTrailingSlash: true,
});

export default class ServerAdapterNodeHTTP {
  static searchParamsToObject(entries) {
    if(!entries)return {};

    const result = {}
    for(const [key, value] of entries) {
      result[key] = value;
    }
    return result;
  }

  //parse form body;
  static async parseBody(incomingMessage) {
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
    const serve = serveStatic(path.normalize(Central.APP_PATH + '/../public'), { index: ['index.html', 'index.htm'] });

    const app = {
      listen: (port) => {
        //serve static files
        //if no static file, then router lookup
        const server = http.createServer((req, res)=>{
          if(Central.config.system.serve_static_file){
            serve(req, res, () => {
              router.lookup(req, res);
            });
            return;
          }
          router.lookup(req, res);
        });
        server.listen(port);
      },
      route: it => {
        router.on(it.method, it.url, async (incomingMessage, reply, params) =>{
          const req = {headers: incomingMessage.headers};
          if(incomingMessage.method === 'POST'){
            req.body = await this.parseBody(incomingMessage);
          }

          const url = new URL(incomingMessage.url, `http://${incomingMessage.headers.host}`);
          req.cookies = cookie.parse(incomingMessage.headers.cookie || "", Central.config.cookie?.options || {});
          req.params = params || {};
          req.query = this.searchParamsToObject(url.searchParams.entries());
          req.raw = {
            hostname: url.hostname,
            headers: incomingMessage.headers,
          }

          await it.handler(req, reply);
        })
      }
    };
    //notfound

    RouteList.createRoute(app, RouteAdapter);
    return { listen : port => app.listen({port})};
  }
}
