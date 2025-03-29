"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseResponse = void 0;
class BaseResponse {
    constructor(status, code, data, msg) {
        this.status = status;
        this.code = code;
        this.data = data;
        this.msg = msg;
    }
    static success(data, msg = 'Success', code = 200) {
        return new BaseResponse(true, code, data, msg);
    }
    static error(msg = 'Error', code = 400, data = null) {
        return new BaseResponse(false, code, data, msg);
    }
}
exports.BaseResponse = BaseResponse;
