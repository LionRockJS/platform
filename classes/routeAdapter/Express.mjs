
export default class RouteAdapterExpress {
  static async handler(result, reply) {
    // set cookie if fastify-cookie loaded
    if (reply.setCookie) {
      result.cookies.forEach(cookie => {
        reply.cookie(cookie.name, cookie.value, cookie.options);
      });
    }

    Object.keys(result.headers).forEach(headerName => {
      reply.append(headerName, result.headers[headerName]);
    });
    reply.status(result.status);
    reply.send(result.body);
  }

  static addRoute(app, route, callback) {
    switch (route.method) {
      case "POST":
        return app.post(route.path, callback);
      case "PUT":
        return app.put(route.path, callback);
      case "DELETE":
        return app.delete(route.path, callback);
      case "GET":
      default:
        return app.get(route.path, callback);
    }
  }
}