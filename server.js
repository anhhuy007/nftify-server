require("dotenv").config();
const express = require("express");
const connect = require("./connect");

const itemRoute = require("./routes/Items.config");

const app = express();

connect.connectDB();
//parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//routes
app.use("/items", itemRoute);


app.get('/', function(req, res){
	res.send("<h2>This is my first app</h2>");
})

app.listen(process.env.PORT, () => {
  console.log(`Server is on http://localhost:${process.env.PORT}`);
});