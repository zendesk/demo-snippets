class ValidationError extends Error {
    constructor(status, message, detail) {
        super(message)
        this.status = status;
        this.message = message;
        this.detail = detail;
    }
}

module.exports = { ValidationError };