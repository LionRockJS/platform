
export default class RouteAdapterFastify {
  static async handler(result, reply) {
    // set cookie if fastify-cookie loaded
    if (reply.setCookie) {
      result.cookies.forEach(cookie => {
        reply.setCookie(cookie.name, cookie.value, cookie.options);
      });
    }

    Object.keys(result.headers).forEach(headerName => {
      reply.header(headerName, result.headers[headerName]);
    });
    reply.code(result.status);
    reply.send(result.body);
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