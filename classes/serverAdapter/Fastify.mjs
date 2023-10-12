import { Central, RouteList } from '@lionrockjs/central';
import RouteAdapter from "../routeAdapter/Fastify.mjs";

import path from 'node:path';
import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyFormBody from '@fastify/formbody';
import fastifyCookie from '@fastify/cookie';
import fastifyExpress from '@fastify/express';

export default class ServerAdapterFastify {
  static async setup() {
    const app = Fastify({
      logger: false,
      ignoreTrailingSlash: true,
    });

    //serve static files
    app.register(fastifyStatic, {
      root: path.normalize(`${Central.APP_PATH}/../public/media`),
      prefix: '/media/',
    })

    app.register(fastifyFormBody);

    app.addContentTypeParser('multipart/form-data', (request, payload, done) => done());

    if (Central.config.cookie) {
      app.register(fastifyCookie, {
        secret: Central.config.cookie.salt,
        parseOptions: Central.config.cookie.options,
      });
    }

    await app.register(fastifyExpress);

    app.setNotFoundHandler((request, reply) => {
      // Default not found handler with preValidation and preHandler hooks
      const { language } = request.params;
      const url = language ? `/${language}/pages/404` : '/pages/404';
      reply.redirect(`${url}?s=${request.url.replace('?', '%3F').replaceAll('&', '%26')}`);
    });

    RouteList.createRoute(app, RouteAdapter);

    return {listen:port => app.listen({port})};
  }
}
