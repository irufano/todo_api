const todoRoutes = (app) => {
  const express = require("express");
  const { authJwt } = require("../middleware");
  const controller = require("../controllers/todo.controller");
  const router = express.Router();
  const AppError = require("../utils/appError");

  router.route("/").get([authJwt.verifyToken], controller.findAll);
  router.route("/").post([authJwt.verifyToken], controller.createTodo);
  router.route("/:id").get([authJwt.verifyToken], controller.getTodo);
  router.route("/:id").put([authJwt.verifyToken], controller.updateTodo);
  router.route("/:id").delete([authJwt.verifyToken], controller.deleteTodo);

  // handle not allowed method
  router.route("/").all((req, res, next) => {
    return next(new AppError("Method not allowed", 405));
  });
  router.route("/:id").all((req, res, next) => {
    return next(new AppError("Method not allowed", 405));
  });

  // base endpoint
  app.use("/api/secured/todo", router);
};

module.exports = todoRoutes;
