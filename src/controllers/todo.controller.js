const AppError = require("../utils/appError");
const Todo = require("../models/todo.model");

exports.findAll = (req, res, next) => {
  Todo.getAllTodos((err, data) => {
    if (err) return next(new AppError(err));
    res.status(200).json({
      status: "success",
      length: data?.length,
      data: data,
    });
  });
};

exports.createTodo = (req, res, next) => {
  if (!req.body) return next(new AppError("No form data found", 404));
  Todo.createTodo(req.body.name, (err, data) => {
    if (err) return next(new AppError(err, 500));
    res.status(201).json({
      status: "success",
      message: "Todo created!",
    });
  });
};

exports.getTodo = (req, res, next) => {
  if (!req.params.id) return next(new AppError("No todo id found", 404));
  Todo.getTodo(req.params.id, (err, data, fields) => {
    if (err) return next(new AppError(err, 500));
    res.status(200).json({
      status: "success",
      // data: data[0] || null,
      data: data.map(function (value) {
        return {
          id: value.id,
          name: value.name,
          status: value.status,
          createdDate: value.date_created,
        };
      }),
    });
  });
};

exports.updateTodo = (req, res, next) => {
  if (!req.params.id) return next(new AppError("No todo id found", 404));
  Todo.updateTodo(req.params.id, (err, data, fields) => {
    if (err) return next(new AppError(err, 500));
    res.status(201).json({
      status: "success",
      message: "Todo updated!",
    });
  });
};

exports.deleteTodo = (req, res, next) => {
  if (!req.params.id) return next(new AppError("No todo id found", 404));
  Todo.deleteTodo(req.params.id, (err, fields) => {
    if (err) return next(new AppError(err, 500));
    res.status(201).json({
      status: "success",
      message: "Todo deleted!",
    });
  });
};