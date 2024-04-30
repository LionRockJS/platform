
export default class RouteAdapterNodeHTTP {
  static async handler(result, reply) {
    // set cookie if fastify-cookie loaded
    if (reply.setCookie) {
      result.cookies.forEach(cookie => {
        reply.setHeader('Set-Cookie', `${cookie.name}=${cookie.value}; ${cookie.options}`);
      });
    }

    Object.keys(result.headers).forEach(headerName => {
      reply.setHeader(headerName, result.headers[headerName]);
    });
    reply.statusCode = result.status;
    reply.end(result.body);
  }

  static addRoute(app, route, callback) {
    app.route({
      method: route.method,
      url: route.path,
      schema: route.schema || {},
      handler: callback,
    });
  }
}