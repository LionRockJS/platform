import { IncomingMessage, ServerResponse } from 'node:http';

export default class RouteAdapterNodeHTTP {
  static async handler(result: any, reply: ServerResponse) {

    result.cookies.forEach((cookie: any) => {
      let attributes = '';
      if(cookie.options.domain) {
        attributes += `Domain=${cookie.options.domain}; `;
      }
      if(cookie.options.expires) {
        attributes += `Expires=${cookie.options.expires}; `;
      }
      if(cookie.options.httpOnly) {
        attributes += `HttpOnly; `;
      }
      if(cookie.options.maxAge) {
        attributes += `Max-Age=${cookie.options.maxAge}; `;
      }
      if(cookie.options.path) {
        attributes += `Path=${cookie.options.path}; `;
      }
      if(cookie.options.secure) {
        attributes += `Secure; `;
      }
      if(cookie.options.sameSite) {
        attributes += `SameSite=${cookie.options.sameSite}; `;
      }

      //remove trailing semicolon
      attributes = attributes.replace(/; $/, '');
      reply.setHeader('Set-Cookie', `${cookie.name}=${cookie.value}; ${attributes}`);
    });

    Object.keys(result.headers).forEach(headerName => {
      reply.setHeader(headerName, result.headers[headerName]);
    });
    reply.statusCode = result.status;
    reply.end(result.body);
  }

  static addRoute(app: any, route: any, callback: any) {
    app.route({
      method: route.method,
      url: route.path,
      schema: route.schema || {},
      handler: callback,
    });
  }
}
