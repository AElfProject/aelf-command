export default Socket;
declare class Socket {
    constructor(options: any);
    aelf: any;
    defaultEndpoint: any;
    wallet: any;
    address: any;
    handleConnection(client: any): void;
    socket: Server<import("socket.io/dist/typed-events.js").DefaultEventsMap, import("socket.io/dist/typed-events.js").DefaultEventsMap, import("socket.io/dist/typed-events.js").DefaultEventsMap, any>;
    clientConfig: {};
    responseFormat(id: any, result: any, errors: any): {
        id: any;
        result: {
            error: any[];
            code: any;
            msg: any;
            data: any;
        };
    };
    send(client: any, result: any, action: any, appId: any): void;
    deserializeParams(request: any): Promise<string>;
    serializeResult(appId: any, result: any): any;
    handleConnect(message: any): Promise<{
        publicKey: string;
        random: any;
        signature?: undefined;
    } | {
        publicKey: any;
        random: any;
        signature: any;
    }>;
    handleMethodList(message: any): Promise<string[]>;
    handleApi(message: any, ...args: any[]): Promise<any>;
    handleAccount(message: any): Promise<{
        accounts: {
            name: string;
            address: any;
            publicKey: any;
        }[];
        chains: {
            url: any;
            isMainChain: boolean;
            chainId: string;
        }[];
    }>;
    handleInvoke(message: any, isReadOnly?: boolean, ...args: any[]): Promise<any>;
    handleDisconnect(message: any): Promise<{}>;
}
import { Server } from 'socket.io';
