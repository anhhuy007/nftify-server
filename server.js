require("dotenv").config();
const express = require("express");
const connect = require("./utils/connect");
const routes = require( "./routes/index.route.js");

const app = express();

connect.connectDB();
//parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//routes
app.use("/api/v1", routes);

app.listen(process.env.PORT, () => {
  console.log(`Server is on http://localhost:${process.env.PORT}`);
});
