import {IoAdapter} from '@nestjs/platform-socket.io';
import {INestApplication} from '@nestjs/common';
import {socketAuthMiddleware} from "../middleware/socketAuthMiddleware";


export class CustomIoAdapter extends IoAdapter {
    constructor(private app: INestApplication) {
        super(app);
    }

    createIOServer(port: number, options?: any): any {
        const server = super.createIOServer(port, options);
        server.use(socketAuthMiddleware);
        return server;
    }
}