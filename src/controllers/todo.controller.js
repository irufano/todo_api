const AppError = require("../utils/appError");
const Todo = require("../models/todo.model");

exports.findAll = (req, res, next) => {
  Todo.getAllTodos((err, data) => {
    if (err) return next(new AppError(err));
    res.status(200).json({
      status: "success",
      data: data,
      info: null,
    });
  });
};

exports.createTodo = (req, res, next) => {
  if (Object.keys(req.body).length === 0)
    return next(new AppError("No raw data found", 404));
  Todo.createTodo(req.body.name, (err, data) => {
    if (err) return next(new AppError(err, 500));
    res.status(201).json({
      status: "success",
      data: "Todo created!",
      info: null,
    });
  });
};

exports.getTodo = (req, res, next) => {
  if (!req.params.id) return next(new AppError("No todo id found", 404));
  Todo.getTodo(req.params.id, (err, data, fields) => {
    let info;
    if (err) return next(new AppError(err, 500));
    if (data.length === 0) {
      info = {
        message: "Todo not found",
        messageEn: null,
        messageId: null,
        field: null,
        redirect: null,
      };
    }
    res.status(200).json({
      status: "success",
      data: data.map(function (value, index) {
        return {
          id: value.id,
          name: value.name,
          status: value.status,
          createdDate: value.date_created,
        };
      }),
      info: info || null,
    });
  });
};

exports.updateTodo = (req, res, next) => {
  if (!req.params.id) return next(new AppError("No todo id found", 404));
  Todo.updateTodo(req.params.id, (err, data, fields) => {
    if (err) return next(new AppError(err, 500));
    res.status(201).json({
      status: "success",
      data: "Todo updated!",
      info: null,
    });
  });
};

exports.deleteTodo = (req, res, next) => {
  if (!req.params.id) return next(new AppError("No todo id found", 404));
  Todo.deleteTodo(req.params.id, (err, fields) => {
    if (err) return next(new AppError(err, 500));
    res.status(201).json({
      status: "success",
      data: "Todo deleted!",
      info: null,
    });
  });
};
