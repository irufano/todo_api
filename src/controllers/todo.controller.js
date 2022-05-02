const AppError = require("../utils/appError");
const AppSuccess = require("../utils/appSuccess");
const Todo = require("../models/todo.model");

exports.findAll = (req, res, next) => {
  Todo.getAllTodos((err, data) => {
    if (err) return next(new AppError(err));
    res.status(200).json(new AppSuccess({ data: data }));
  });
};

exports.createTodo = (req, res, next) => {
  if (Object.keys(req.body).length === 0)
    return next(new AppError("No raw data found", 404));
  Todo.createTodo(req.body.name, (err, data) => {
    if (err) return next(new AppError(err, 500));
    res.status(201).json(new AppSuccess({ data: "Todo created!" }));
  });
};

exports.getTodo = (req, res, next) => {
  if (!req.params.id) return next(new AppError("No todo id found", 404));
  Todo.getTodo(req.params.id, (err, data, fields) => {
    if (err) return next(new AppError(err, 500));
    if (data.length === 0) {
      return next(new AppError("Todo not found", 200, { data: [] }));
    }
    res.status(200).json(
      new AppSuccess({
        data: data.map(function (value, index) {
          return {
            id: value.id,
            name: value.name,
            status: value.status,
            createdDate: value.date_created,
          };
        }),
      })
    );
  });
};

exports.updateTodo = (req, res, next) => {
  if (!req.params.id) return next(new AppError("No todo id found", 404));
  Todo.updateTodo(req.params.id, (err, data, fields) => {
    if (err) return next(new AppError(err, 500));
    res.status(201).json(new AppSuccess({ data: "Todo updated!" }));
  });
};

exports.deleteTodo = (req, res, next) => {
  if (!req.params.id) return next(new AppError("No todo id found", 404));
  Todo.deleteTodo(req.params.id, (err, fields) => {
    if (err) return next(new AppError(err, 500));
    res.status(201).json(new AppSuccess({ data: "Todo deleted!" }));
  });
};
