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

  pool.query(todoTable, (error, results) => {
    if (error) {
      console.error(error);
      console.error(error.sqlMessage);
      pool.end();
      return;
    }

    console.log(results);
    console.log("Tables created successfully");
    pool.end();
  });
};

module.exports = {
  pool,
  createTables,
};

require("make-runnable");
