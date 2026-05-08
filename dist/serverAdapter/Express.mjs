import express from 'express';
import { Central } from '@lionrockjs/central';
import { RouteList } from '@lionrockjs/router';
import RouteAdapter from "../routeAdapter/Express.mjs";
import path from 'node:path';
import cookieParser from 'cookie-parser';
export default class ServerAdapterExpress {
    static async setup() {
        const app = express();
        if (Central.config.system.serve_static_file) {
            const staticFilePath = path.normalize(`${Central.APP_PATH}/../public/media`);
            app.use('/media', express.static(staticFilePath));
        }
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        app.use((request, res, next) => {
            request.raw = request;
            next();
        });
        if (Central.config.cookie) {
            app.use(cookieParser(Central.config.cookie.salt, Central.config.cookie.options));
        }
        RouteList.createRoute(app, RouteAdapter);
        return app;
    }
}
