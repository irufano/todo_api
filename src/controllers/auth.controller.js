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
        body("roles", "roles is required").exists(),
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

exports.register = async (req, res, next) => {
  try {
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

    if (req.body.roles.length <= 0 || Array.isArray(req.body.roles) === false)
      return next(new AppError("No roles provided", 500));

    const userResult = await User.createUser(
      req.body.username,
      req.body.email,
      bcrypt.hashSync(req.body.password, 8),
      req.body.fullname
    );

    if (req.body.roles.length !== 0) {
      for (var key in req.body.roles) {
        if (req.body.roles.hasOwnProperty(key)) {
          await addUserRole(
            userResult.userId,
            req.body.roles[key].roleId,
            req.body.username,
            next
          );
        }
      }
    }

    res.status(201).json(new AppSuccess({ data: "Signup success" }));
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      // unique key on create user are uername only so :
      return next(
        new AppError("Username already exist", 500, { id: err.code })
      );
    return next(new AppError(err, 500));
  }
};

exports.login = async (req, res, next) => {
  try {
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

    // get user
    const userResult = await User.getUser(req.body.username);
    if (userResult.length === 0)
      return next(new AppError("User not found", 404));

    // check password
    let passwordIsValid = bcrypt.compareSync(
      req.body.password,
      userResult[0].password
    );
    if (!passwordIsValid)
      return next(new AppError("Invalid password or username", 401));

    // get role
    const roleResult = await User.getUserRole(userResult[0].id);

    let user = {
      id: userResult[0].id,
      username: userResult[0].username,
      email: userResult[0].email,
      roleId: userResult[0].role_id,
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

    // result
    res.status(200).json(
      new AppSuccess({
        data: {
          accessToken: token,
          refreshToken: refreshToken,
          userId: userResult[0].id,
          fullname: userResult[0].fullname,
          roles: roleResult,
        },
      })
    );
  } catch (err) {
    return next(new AppError(err, 500));
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
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

    jwt.verify(
      refreshToken,
      config.refreshSecret,
      async (err, refreshDecoded) => {
        if (err) {
          if (err instanceof TokenExpiredError)
            return next(
              new AppError("Refresh token expired, signin again!", 401)
            );
          else return next(new AppError("Unauthorized", 401));
        }
        var accessDecoded = jwt.decode(accessToken, { complete: true });
        if (accessDecoded.payload.id !== refreshDecoded.id) {
          return next(new AppError("Token mismatch!", 401));
        }

        /// check to database is user exist
        const userResult = await User.getUserById(refreshDecoded.id);
        if (userResult.length === 0)
          return next(new AppError("User not found", 404));

        let user = {
          id: userResult[0].id,
          username: userResult[0].username,
          email: userResult[0].email,
          roleId: userResult[0].role_id,
        };

        let newAccesstoken = jwt.sign(user, config.secret, {
          expiresIn: config.jwtExpiration,
          audience: "myaud",
          issuer: "myissuer",
          jwtid: "1",
          subject: "access",
        });

        let newRefreshToken = jwt.sign(user, config.refreshSecret, {
          expiresIn: config.jwtRefreshExpiration,
          // ignoreExpiration: true
        });

        // result
        res.status(200).json(
          new AppSuccess({
            data: {
              accessToken: newAccesstoken || null,
              refreshToken: newRefreshToken || null,
            },
          })
        );

        // User.getUserById(refreshDecoded.id, (err, data) => {
        //   if (err) return next(new AppError(err, 500));
        //   if (data.length === 0) return next(new AppError("User not found", 404));

        //   let user = {
        //     id: data[0].id,
        //     username: data[0].username,
        //     email: data[0].email,
        //     roleId: data[0].role_id,
        //   };

        //   let newAccesstoken = jwt.sign(user, config.secret, {
        //     expiresIn: config.jwtExpiration,
        //     audience: "myaud",
        //     issuer: "myissuer",
        //     jwtid: "1",
        //     subject: "access",
        //   });

        //   let newRefreshToken = jwt.sign(user, config.refreshSecret, {
        //     expiresIn: config.jwtRefreshExpiration,
        //     // ignoreExpiration: true
        //   });

        //   res.status(200).json(
        //     new AppSuccess({
        //       data: {
        //         accessToken: newAccesstoken || null,
        //         refreshToken: newRefreshToken || null,
        //       },
        //     })
        //   );
        // });
      }
    );
  } catch (err) {
    return next(new AppError(err, 500));
  }
};

async function addUserRole(userId, roleId, username, next) {
  try {
    const result = await User.addUserRole(userId, roleId);
    return result;
  } catch (err) {
    console.log(err);
    // delete user if failed
    await User.deleteUser(username);
    if (err.code === "ER_NO_REFERENCED_ROW_2") {
      return next(new AppError("roleId not available", 500, { id: err.code }));
    }
    return next(new AppError(err, 500));
  }
}
