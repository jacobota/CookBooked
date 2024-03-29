//imports
const express = require("express");
const cors = require("cors");
const { logger } = require("./src/util/logger");

//Routers
//TODO
const accountsRouter = require("./src/controller/AccountsRouter");
const reviewsRouter = require("./src/controller/ReviewsRouter");
const commentsRouter = require("./src/controller/CommentsRouter");

//create the server on PORT 3000
const app = express();
const PORT = 3000;

app.listen(PORT, () => {
  logger.info(`Started the server on Port ${PORT}`);
});

// enable cors
app.use(cors());

//middleware to change body requests to json
app.use(express.json());

//middleware to log incoming requests
app.use((req, res, next) => {
  logger.info(`Incoming ${req.method}: ${req.url}`);
  next();
});

//HTTP Routes:
//TODO

app.use("/accounts", accountsRouter);

app.use("/reviews", reviewsRouter);

app.use("/comments", commentsRouter);
