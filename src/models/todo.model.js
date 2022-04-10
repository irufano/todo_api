const { pool } = require("../services/db");

class Todo {
  constructor(todo) {
    this.name = todo.name;
  }

  /* GET ALL TODOS */
  static getAllTodos = (result) => {
    let query = "SELECT * FROM todo";
    pool.query(query, function (err, data, fields) {
      if (err) return result(null, err);
      result(null, data);
    });
  };

  /* CREATE TODO */
  static createTodo = (name, result) => {
    let query = "INSERT INTO todo (name, status) VALUES(?)";
    let values = [name, "pending"];
    pool.query(query, [values], function (err, data, fields) {
      if (err) return result(null, err);
      result(null, data);
    });
  };

  /* GET TODO BY ID */
  static getTodo = (id, result) => {
    let query = "SELECT * FROM todo WHERE id = ?";
    pool.query(query, [id], function (err, data, fields) {
      if (err) return result(null, err);
      result(null, data);
    });
  };

  /* UPDATE TODO BY ID */
  static updateTodo = (id, result) => {
    let query = "UPDATE todo SET status='completed' WHERE id = ?";
    pool.query(query, [id], function (err, data, fields) {
      if (err) return result(null, err);
      result(null, data);
    });
  };

  /* DELETE TODO BY ID */
  static deleteTodo = (id, result) => {
    let query = "DELETE FROM todo WHERE id = ?";
    pool.query(query, [id], function (err, data, fields) {
      if (err) return result(null, err);
      result(null, data);
    });
  };
}

module.exports = Todo;
