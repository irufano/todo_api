class AppError extends Error {
  constructor(
    msg,
    statusCode,
    {
      id = null,
      data = null,
      messageEn = null,
      messageId = null,
      field = null,
      redirect = null,
    } = {}
  ) {
    super(msg);

    this.statusCode = statusCode;
    this.error = `${statusCode}`.startsWith(4) ? "fail" : "error";
    this.isOperational = true;
    this.data = data;
    this.info = {
      id: id || null,
      message: this.message || null,
      messageEn: messageEn || this.message,
      messageId: messageId || this.message,
      field: field,
      redirect: redirect,
    };

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
