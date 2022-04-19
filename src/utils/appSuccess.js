class AppSuccess {
  constructor({ status = "success", info = null, data = null } = {}) {
    this.status = status || null;
    this.data = data || null;
    this.info = info || null;
  }

  toJson() {
    return {
      status: this.status,
      data: this.data,
      info: this.info,
    };
  }
}

module.exports = AppSuccess;
