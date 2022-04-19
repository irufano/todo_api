const AppError = require("../utils/appError");
const AppSuccess = require("../utils/appSuccess");
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { TokenExpiredError } = require("jsonwebtoken");
const config = require("../configs/auth.config");
const { body, validationResult } = require("express-validator");

exports.validate = (method) => {
  switch (method) {
    case "register": {
      return [
        body("username", "username is required").exists(),
        body("email", "email is required").exists(),
        body("password", "password is required").exists(),
        body("fullname", "fullname is required").exists(),
      ];
    }
    case "login": {
      return [
        body("username", "username is required").exists(),
        body("password", "password is required").exists(),
      ];
    }
    case "refresh-token": {
      return [
        body("accessToken", "accessToken is required").exists(),
        body("refreshToken", "refreshToken is required").exists(),
      ];
    }
  }
};

exports.register = (req, res, next) => {
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
    req.body.roleId || 3, // default role = 3 (user)
    req.body.username,
    req.body.email,
    bcrypt.hashSync(req.body.password, 8),
    req.body.fullname,
    (err, data) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY")
          // unique key on create user are uername only so :
          return next(
            new AppError("Username already exist", 500, { id: err.code })
          );
        return next(new AppError(err, 500));
      }
      res.status(201).json(new AppSuccess({ data: "Signup success" }));
    }
  );
};

exports.login = (req, res, next) => {
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

  User.getUser(req.body.username, (err, data) => {
    if (err) return next(new AppError(err, 500));
    if (data.length === 0) return next(new AppError("User not found", 404));
    let passwordIsValid = bcrypt.compareSync(
      req.body.password,
      data[0].password
    );
    if (!passwordIsValid) {
      return next(new AppError("Invalid password or username", 401));
    }
    let user = {
      id: data[0].id,
      username: data[0].username,
      email: data[0].email,
      roleId: data[0].role_id,
    };
    let token = jwt.sign(user, config.secret, {
      expiresIn: config.jwtExpiration,
      audience: "myaud",
      issuer: "myissuer",
      jwtid: "1",
      subject: "user",
    });
    let refreshToken = jwt.sign(user, config.refreshSecret, {
      expiresIn: config.jwtRefreshExpiration,
    });
    res.status(200).json(
      new AppSuccess({
        data: {
          accessToken: token,
          refreshToken: refreshToken,
          userId: data[0].id,
          fullname: data[0].fullname,
          roleId: data[0].role_id,
        },
      })
    );
  });
};

exports.refreshToken = (req, res, next) => {
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

  let accessToken = req.body.accessToken;
  let refreshToken = req.body.refreshToken;

  jwt.verify(refreshToken, config.refreshSecret, (err, refreshDecoded) => {
    if (err) {
      if (err instanceof TokenExpiredError)
        return next(new AppError("Refresh token expired, signin again!", 401));
      else return next(new AppError("Unauthorized", 401));
    }
    var accessDecoded = jwt.decode(accessToken, { complete: true });
    if (accessDecoded.payload.id !== refreshDecoded.id) {
      return next(new AppError("Token mismatch!", 401));
    }

    /// check to database is user exist
    User.getUserById(refreshDecoded.id, (err, data) => {
      if (err) return next(new AppError(err, 500));
      if (data.length === 0) return next(new AppError("User not found", 404));

      let user = {
        id: data[0].id,
        username: data[0].username,
        email: data[0].email,
        roleId: data[0].role_id,
      };

      let newAccesstoken = jwt.sign(user, config.secret, {
        expiresIn: config.jwtExpiration,
        audience: "myaud",
        issuer: "myissuer",
        jwtid: "1",
        subject: "user",
      });

      let newRefreshToken = jwt.sign(user, config.refreshSecret, {
        expiresIn: config.jwtRefreshExpiration,
      });

      res.status(200).json(
        new AppSuccess({
          data: {
            accessToken: newAccesstoken || null,
            refreshToken: newRefreshToken || null,
          },
        })
      );
    });
  });
};
