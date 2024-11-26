require("dotenv").config();
const express = require("express");
const connect = require("./utils/connect");

//routes
const stampRoute = require("./routes/stamp.route");
const userRoute = require("./routes/user.route");
const sellerRoute = require("./routes/seller.route");
const collectionRoute = require("./routes/collection.route");


const app = express();

connect.connectDB();
//parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//routes
app.use("/stamp", stampRoute);
app.use("/user", userRoute);
app.use("/seller", sellerRoute);
app.use("/collection", collectionRoute);


app.get('/', function(req, res){
	res.send("<h2>This is my first app</h2>");
})

app.listen(process.env.PORT, () => {
  console.log(`Server is on http://localhost:${process.env.PORT}`);
});
