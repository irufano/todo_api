const AppError = require("../utils/appError");
const InfoError = require("../utils/infoError");
const User = require("../models/user.model");
const { body, validationResult } = require("express-validator");

exports.validate = (method) => {
  switch (method) {
    case "createUser": {
      return [
        body("roleId", "roleId is required").exists(),
        body("username", "username is required").exists(),
        body("email", "email is required").exists(),
        body("password", "password is required").exists(),
        body("fullname", "fullname is required").exists(),
      ];
    }
  }
};

exports.createUser = (req, res, next) => {
  const validationErrors = validationResult(req);

  if (Object.keys(req.body).length === 0)
    return next(new AppError("No raw data found", 404));

  // check validation field
  if (!validationErrors.isEmpty()) {
    let message;
    validationErrors.array().forEach(function (err) {
      message =
        (message === undefined ? "" : message) +
        (message === undefined ? "" : ", ") +
        err.msg;
    });
    return next(new AppError(message, 400));
  }

  User.createUser(
    req.body.roleId,
    req.body.username,
    req.body.email,
    req.body.password,
    req.body.fullname,
    (err, data) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY")
          // unique key on create user are uername only so :
          return next(new AppError("Username already exist", 500));
        return next(new AppError(err, 500));
      }
      res.status(201).json({
        status: "success",
        data: "Register success",
        info: null,
      });
    }
  );
};
