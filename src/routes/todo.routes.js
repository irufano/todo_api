const todoRoutes = (app) => {
  const express = require("express");
  const controller = require("../controllers/todo.controller");
  const router = express.Router();
  const AppError = require("../utils/appError");

  router.route("/").get(controller.findAll);
  router.route("/").post(controller.createTodo);
  router.route("/:id").get(controller.getTodo);
  router.route("/:id").put(controller.updateTodo);
  router.route("/:id").delete(controller.deleteTodo);

  // handle not allowed method
  router.route("/").all((req, res, next) => {
    return next(new AppError("Method not allowed", 405));
  });
  router.route("/:id").all((req, res, next) => {
    return next(new AppError("Method not allowed", 405));
  });

  // base endpoint
  app.use("/api/todo", router);
};

module.exports = todoRoutes;
