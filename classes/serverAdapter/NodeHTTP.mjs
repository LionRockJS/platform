import { Central, RouteList } from '@lionrockjs/central';
import RouteAdapter from "../routeAdapter/NodeHTTP.mjs";

import http from 'node:http';
import findMyWay from 'find-my-way';
const router = findMyWay({
  ignoreTrailingSlash: true,
});

export default class ServerAdapterNodeHTTP {
  static async setup() {
    const app = {
      listen: (port) => {
        const server = http.createServer((req, res)=>{
          router.lookup(req, res);
        });
        server.listen(port);
      },
      route: it => {
        router.on(it.method, it.url, (req, reply) =>{
          req.params = req.params || {};
          it.handler(req, reply).then();
        })
      }
    };

    //serve static files
    //formdata
    //notfound

    RouteList.createRoute(app, RouteAdapter);
    return { listen : port => app.listen({port})};
  }
}
