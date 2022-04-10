const express = require("express");
const cors = require("cors");
const app = express();
const todoRouter = require("./src/routes/todo.routes");
const authRouter = require("./src/routes/auth.routes");
const AppError = require("./src/utils/appError");
const errorHandler = require("./src/utils/errorHandler");
var corsOptions = {
  origin: "http://localhost:8081",
};

/* MIDLEWARE */
// HTTP-header based mechanism that allows a server to indicate any origins
app.use(cors(corsOptions));
// parse requests of content-type - application/json
app.use(express.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

/* ROUTER */
todoRouter(app);
authRouter(app);

/* ERROR HANDLER */
app.all("*", (req, res, next) => {
  next(new AppError(`The URL ${req.originalUrl} does not exists`, 404));
});
app.use(errorHandler);

/* LISTEN REQUESTS */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
