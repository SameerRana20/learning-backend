class ApiResponse {
    constructor(statusCode,data, msg="Success" ) {
        this.statusCode = statusCode,
        this.data = data,
        this.success= statusCode < 400
        this.message = msg
    }
}

export {ApiResponse}