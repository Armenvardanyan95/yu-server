abstract class Response<T> {
    success: boolean;
    data: T;
    message: string;
}

export class ErrorResponse<T> extends Response<T> {

    constructor(msg: string) {
        super();
        this.success = false;
        this.data = null;
        this.message = msg;
    }
}

export class SuccessResponse<T> extends Response<T> {

    constructor(d: T) {
        super();
        this.data = d;
        this.success = true;
        this.message = null;
    }
}
