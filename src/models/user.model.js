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

  /* GET USER */
  static getUser = (username, result) => {
    let query = "SELECT * FROM user WHERE username = ? LIMIT 1";
    pool.query(query, [username], function (err, data, fields) {
      if (err) return result(err, null);
      result(null, data);
    });
  };

   /* GET USER BY ID */
   static getUserById = (id, result) => {
    let query = "SELECT * FROM user WHERE id = ? LIMIT 1";
    pool.query(query, [id], function (err, data, fields) {
      if (err) return result(err, null);
      result(null, data);
    });
  };
}

module.exports = User;
