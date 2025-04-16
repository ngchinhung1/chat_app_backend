"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomIoAdapter = void 0;
const platform_socket_io_1 = require("@nestjs/platform-socket.io");
const socketAuthMiddleware_1 = require("../middleware/socketAuthMiddleware");
class CustomIoAdapter extends platform_socket_io_1.IoAdapter {
    constructor(app) {
        super(app);
        this.app = app;
    }
    createIOServer(port, options) {
        const server = super.createIOServer(port, options);
        server.use(socketAuthMiddleware_1.socketAuthMiddleware);
        return server;
    }
}
exports.CustomIoAdapter = CustomIoAdapter;
