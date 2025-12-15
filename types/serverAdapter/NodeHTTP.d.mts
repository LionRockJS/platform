import { IncomingMessage } from 'node:http';
export default class ServerAdapterNodeHTTP {
    static searchParamsToObject(entries: IterableIterator<[string, string]>): Record<string, string>;
    static parseBody(incomingMessage: IncomingMessage): Promise<unknown>;
    static setup(): Promise<{
        listen: (port: any) => void;
    }>;
}
