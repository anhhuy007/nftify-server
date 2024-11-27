require("dotenv").config();
const express = require("express");
const connect = require("./utils/connect");

//routes
const stampRoute = require("./routes/stamp.route");
const collectionRoute = require("./routes/collection.route");
const authRoute = require("./routes/auth.route");

const app = express();

connect.connectDB();
//parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//routes
app.use("/auth", authRoute);
app.use("/stamp", stampRoute);
app.use("/collection", collectionRoute);


app.listen(process.env.PORT, () => {
  console.log(`Server is on http://localhost:${process.env.PORT}`);
});
