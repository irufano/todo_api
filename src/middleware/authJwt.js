const jwt = require("jsonwebtoken");
const config = require("../configs/auth.config");
const AppError = require("../utils/appError");

verifyToken = (req, res, next) => {
  let bearerHeader = req.headers["authorization"];
  if (!bearerHeader)
    return res.status(403).send({
      status: "error",
      info: { message: "Forbidden!" },
    });

  let bearer = bearerHeader.split(" ");
  let bearerToken = bearer[1];
  jwt.verify(bearerToken, config.secret, (err, decoded) => {
    if (err) return next(new AppError("Unauthorized!", 401));
    req.userId = decoded.id;
    next();
  });
};

const authJwt = {
  verifyToken: verifyToken,
};
module.exports = authJwt;
