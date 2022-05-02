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
  static createUser = async (username, email, password, fullname) => {
    let uuid = uuidv4();
    let query =
      "INSERT INTO user (id, username, email, password, fullname) VALUES(?)";
    let values = [uuid, username, email, password, fullname];

    return new Promise((resolve, reject) => {
      pool.query(query, [values], (err, data, fields) => {
        if (err) {
          return reject(err);
        }
        data.userId = uuid;
        return resolve(data);
      });
    });
  };

  /* ADD ROLE USER */
  static addUserRole = async (userId, roleId) => {
    let query = "INSERT INTO user_role (user_id, role_id) VALUES(?)";
    let values = [userId, roleId];

    return new Promise((resolve, reject) => {
      pool.query(query, [values], (err, data, fields) => {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    });
  };

  /* GET USER */
  static getUser = async (username, result) => {
    let query = "SELECT * FROM user WHERE username = ? LIMIT 1";

    return new Promise((resolve, reject) => {
      pool.query(query, [username], function (err, data, fields) {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    });
  };

  /* GET USER BY ID */
  static getUserById = async (id, result) => {
    let query = "SELECT * FROM user WHERE id = ? LIMIT 1";

    return new Promise((resolve, reject) => {
      pool.query(query, [id], function (err, data, fields) {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    });
  };

  /* GET ROLE USER BY ID */
  static getUserRole = async (userId, result) => {
    let query =
      "SELECT r.* FROM role r JOIN user_role ur ON r.id = ur.role_id WHERE ur.user_id = ?";
    return new Promise((resolve, reject) => {
      pool.query(query, [userId], function (err, data, fields) {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    });
  };

  /* DELETE USER */
  static deleteUser = async (username) => {
    let query = "DELETE FROM user WHERE username = ?";
    return new Promise((resolve, reject) => {
      pool.query(query, [username], (err, data, fields) => {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    });
  };

  // select a.fullname, group_concat(distinct c.name order by c.name ASC separator ',') role from user a left join user_role b on a.id = b.user_id left join role c on b.role_id = c.id group by a.fullname;
}

module.exports = User;
