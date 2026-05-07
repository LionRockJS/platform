import { RouteList } from '@lionrockjs/router';
import RouteAdapter from "../routeAdapter/CFWorkers.mjs";
import { Hono } from 'hono';
export default class ServerAdapterCFWorkers {
    static searchParamsToObject(entries) {
        if (!entries)
            return {};
        const result = {};
        for (const [key, value] of entries) {
            result[key] = value;
        }
        return result;
    }
    static parseCookies(cookieHeader) {
        if (!cookieHeader)
            return {};
        return Object.fromEntries(cookieHeader.split(';')
            .map(c => c.trim())
            .filter(Boolean)
            .map(c => {
            const idx = c.indexOf('=');
            return idx < 0 ? [c, ''] : [c.slice(0, idx).trim(), c.slice(idx + 1).trim()];
        }));
    }
    static async setup() {
        const hono = new Hono();
        const app = {
            route: (it) => {
                hono.on(it.method, it.url, async (c) => {
                    const cfRequest = c.req.raw;
                    const url = new URL(cfRequest.url);
                    const req = {
                        headers: Object.fromEntries(cfRequest.headers.entries()),
                    };
                    //parse form body except multipart/form-data
                    if (cfRequest.method === 'POST' &&
                        !/^multipart\/form-data/.test(cfRequest.headers.get('content-type') || '')) {
                        req.body = await cfRequest.text();
                    }
                    req.cookies = this.parseCookies(cfRequest.headers.get('cookie') || '');
                    req.params = c.req.param() || {};
                    req.query = this.searchParamsToObject(url.searchParams.entries());
                    req.raw = cfRequest;
                    req.url = url.pathname;
                    req.hostname = url.hostname;
                    return new Promise((resolve, reject) => {
                        it.handler(req, resolve).catch(reject);
                    });
                });
            }
        };
        RouteList.createRoute(app, RouteAdapter);
        return { fetch: hono.fetch.bind(hono) };
    }
}
