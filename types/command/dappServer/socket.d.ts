import { Server } from 'socket.io';
import type { Rules } from 'async-validator';
import Schema from 'async-validator';

declare const signRequestRules: Rules;
declare const encryptRequestRules: Rules;
declare const connectSignRules: Rules;
declare const connectEncryptRules: Rules;

declare const signRequestValidator: Schema;
declare const encryptRequestValidator: Schema;
declare const connectSignValidator: Schema;
declare const connectEncryptValidator: Schema;

interface SocketOptions {
  port: number;
  endpoint: string;
  aelf: any;
  wallet: any;
  address: string;
}

interface Message {
  id: string;
  appId: string;
  action: string;
  params: any;
}

interface Result {
  code: number;
  msg: string;
  error: any[];
  data: any;
}

interface Client {
  emit(event: string, data: any): void;
  disconnect(close?: boolean): void;
  on(event: string, cb: Function): void;
}
declare class Socket {
  private aelf: any;
  private defaultEndpoint: string;
  private wallet: any;
  private address: string;
  private socket: Server;
  private clientConfig: { [key: string]: any };

  constructor(options: SocketOptions);

  private responseFormat(id: string, result?: any, errors?: any): { id: string; result: Result };
  private send(client: Client, result: Result, action: string, appId: string): void;
  private handleConnection(client: Client): void;
  private deserializeParams(request: Message): Promise<any>;
  private serializeResult(appId: string, result: any): any;
  private handleConnect(message: Message): Promise<any>;
  private handleMethodList(message: Message): Promise<string[]>;
  private handleApi(message: Message): Promise<any>;
  private handleAccount(message: Message): Promise<any>;
  private handleInvoke(message: Message, isReadOnly: boolean): Promise<any>;
  private handleDisconnect(message: Message): Promise<{}>;
}

export default Socket;
