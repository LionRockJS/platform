import { ServerResponse } from 'node:http';
export default class RouteAdapterNodeHTTP {
    static handler(result: any, reply: ServerResponse): Promise<void>;
    static addRoute(app: any, route: any, callback: any): void;
}
