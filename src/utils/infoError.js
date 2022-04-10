class InfoError {
  constructor(message, messageEn, messageId, field, redirect) {

    this.message = message;
    this.messageEn = messageEn;
    this.messageId = messageId;
    this.field = field;
    this.redirect = redirect;
  }
}

module.exports = InfoError;
