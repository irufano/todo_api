const authRoutes = (app) => {
  const express = require("express");
  const controller = require("../controllers/auth.controller");
  const router = express.Router();
  const AppError = require("../utils/appError");

  router
    .route("/signup")
    .post(controller.validate("register"), controller.register);
  router.route("/signin").post(controller.validate("login"), controller.login);
  router
    .route("/refresh-token")
    .post(controller.validate("refresh-token"), controller.refreshToken);

  // handle not allowed method
  router.route("/signup").all((req, res, next) => {
    return next(new AppError("Method not allowed", 405));
  });
  router.route("/signin").all((req, res, next) => {
    return next(new AppError("Method not allowed", 405));
  });

  // base endpoint
  app.use("/api/auth", router);
};

module.exports = authRoutes;
