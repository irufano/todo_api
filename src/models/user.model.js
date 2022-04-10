const { pool } = require("../services/db");
const { v4: uuidv4 } = require("uuid");

class User {
  constructor(user) {
    this.id = user.id;
    this.role_id = user.role_id;
    this.username = user.username;
    this.email = user.email;
    this.password = user.password;
    this.fullname = user.fullname;
    this.address = user.address;
    this.phone_number = user.phone_number;
  }

  /* GET ALL USERS */
  static getAllUser = (result) => {
    let query = "SELECT * FROM user";
    pool.query(query, function (err, data, fields) {
      if (err) return result(null, err);
      result(null, data);
    });
  };

  /* CREATE USER */
  static createUser = (roleId, username, email, password, fullname, result) => {
    let uuid = uuidv4();
    let query =
      "INSERT INTO user (id, role_id, username, email, password, fullname) VALUES(?)";
    let values = [uuid, roleId, username, email, password, fullname];
    pool.query(query, [values], function (err, data, fields) {
      if (err) return result(err, null);
      result(null, data);
    });
  };
}

module.exports = User;
