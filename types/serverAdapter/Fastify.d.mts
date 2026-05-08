export default class ServerAdapterFastify {
    static setup(): Promise<{
        listen: (port: number) => Promise<string>;
    }>;
}
