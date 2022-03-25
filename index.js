require("dotenv").config();
require("./models");
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;

// middlewares
app.use(cors());
app.use(express.json());

const middleWare = (req, res, next) => {
  console.log(`incoming request: ${req.method} - ${req.url}`);
  next();
};

app.get("/", (req, res) => {
  res.json({ msg: "welcome to the app" });
});

app.use("/api-v1/users", require("./controllers/api-v1/users"));

app.listen(PORT, () => console.log(`connected to port ${PORT}`));
