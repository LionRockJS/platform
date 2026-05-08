export default class ServerAdapterCFWorkers {
    static searchParamsToObject(entries: IterableIterator<[string, string]>): Record<string, string>;
    static parseCookies(cookieHeader: string): Record<string, string>;
    static setup(): Promise<{
        listen: (request: any) => Response | Promise<Response>;
    }>;
}
