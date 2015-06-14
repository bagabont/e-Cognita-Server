var HttpError = function (status, message) {
    this.status = status;
    this.message = message;
    Error.call(this, message);
};
HttpError.prototype = Object.create(Error.prototype);
HttpError.constructor = new HttpError();

module.exports = HttpError;