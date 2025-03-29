export class BaseResponse<T> {
    constructor(
        public status: boolean,
        public code: number,
        public data: T | null,
        public msg: string,
    ) {
    }

    static success<T>(data: T, msg = 'Success', code = 200): BaseResponse<T> {
        return new BaseResponse(true, code, data, msg);
    }

    static error<T>(msg = 'Error', code = 400, data: T | null = null): BaseResponse<T> {
        return new BaseResponse(false, code, data, msg);
    }
}
