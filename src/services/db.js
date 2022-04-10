const mysql = require("mysql");
const dbConfig = require("./db.config");

// const connection = mysql.createConnection({
//   host: dbConfig.HOST,
//   user: dbConfig.USER,
//   password: dbConfig.PASSWORD,
//   database: dbConfig.DB,
// });

const pool = mysql.createPool({
  connectionLimit: 100, //important
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
  acquireTimeout: 2000,
});

pool.getConnection((err, connection) => {
  if (err) throw err;
  console.log("Database connected successfully");
  connection.release();
});

const createTables = () => {
  console.log("-- CREATE TABLE SCRIPT @createTables --");
  const todoTable = `CREATE TABLE todo   
  (
        id int NOT NULL AUTO_INCREMENT,
        name varchar(50) NOT NULL,
        status varchar(50),
        date_created DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, 
        PRIMARY KEY (id)
  )`;

  const roleTable = `CREATE TABLE role   
  (
        id int NOT NULL PRIMARY KEY,
        name varchar(50) NOT NULL
  )`;

  const insertRole = "INSERT INTO role (id, name) VALUES(?)";

  execQuery(todoTable, "create todo", null, (message) => {});
  execQuery(roleTable, "create role", null, (message) => {});

  execQuery(insertRole, "insert role", [1, "super_admin"], (message) => {});
  execQuery(insertRole, "insert role", [2, "admin"], (message) => {});
  execQuery(insertRole, "insert role", [3, "user"], (message) => {});
};

function execQuery(query, queryName, values, callback) {
  if (values != null) {
    pool.query(query, [values], (error, results, fields) => {
      if (error) {
        console.error(error);
        console.error(error.sqlMessage);
        pool.end();
        callback(error.sqlMessage);
        return;
      }

      let message = `Query ${queryName} run successfully`;
      console.log(results);
      console.log(message);
      pool.end();
      callback(message);
    });
    return;
  }

  pool.query(query, (error, results) => {
    if (error) {
      console.error(error);
      console.error(error.sqlMessage);
      pool.end();
      callback(error.sqlMessage);
      return;
    }

    let message = `Query ${queryName} run successfully`;
    console.log(results);
    console.log(message);
    pool.end();
    callback(message);
  });
}

module.exports = {
  pool,
  createTables,
};

require("make-runnable");
