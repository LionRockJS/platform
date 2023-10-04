import { Central, RouteList } from 'lionrockjs';
import RouteAdapter from "../routeAdapter/Fastify.mjs";

import path from 'node:path';
import Fastify from 'fastify';

export default class ServerAdapterFastify {
  static async setup() {
    const fastifyStatic = await import('@fastify/static');
    const fastifyFormBody = await import('@fastify/formbody');
    const fastifyCookie = await import('@fastify/cookie');
    const fastifyExpress = await import('@fastify/express');

    const app = Fastify({
      logger: false,
      ignoreTrailingSlash: true,
    });

    app.register(fastifyStatic, {
      root: path.normalize(`${Central.APP_PATH}/../public/media`),
      prefix: '/media/',
    })

    app.register(fastifyFormBody);

    app.addContentTypeParser('multipart/form-data', (request, payload, done) => {
      done();
    })

    if (Central.config.cookie) {
      app.register(fastifyCookie, {
        secret: Central.config.cookie.salt,
        parseOptions: Central.config.cookie.options,
      });
    }

    await app.register(fastifyExpress);

    if (Central.config.site?.notFound) {
      app.setNotFoundHandler((request, reply) => {
        // Default not found handler with preValidation and preHandler hooks
        const { language } = request.params;
        const url = language ? `/${language}/pages/404` : '/pages/404';
        reply.redirect(`${url}?s=${request.url.replace('?', '%3F').replaceAll('&', '%26')}`);
      });
    }

    RouteList.createRoute(app, RouteAdapter);

    return {listen:port => app.listen({port})};
  }
}
