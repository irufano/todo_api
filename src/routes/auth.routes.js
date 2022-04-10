const authRoutes = (app) => {
  const express = require("express");
  const controller = require("../controllers/auth.controller");
  const router = express.Router();
  const AppError = require("../utils/appError");

  router
    .route("/register")
    .post(controller.validate("createUser"), controller.createUser);

  // handle not allowed method
  router.route("/register").all((req, res, next) => {
    return next(new AppError("Method not allowed", 405));
  });

  // base endpoint
  app.use("/api/auth", router);
};

module.exports = authRoutes;
