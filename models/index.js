const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1/dil";

mongoose.connect(MONGODB_URI);

const db = mongoose.connection;

db.once("open", () => console.log(`connect to mongo @ ${db.host}:${db.port}`));

db.on("error", (err) => {
  console.log("server error");
  console.log(err);
});

module.exports.User = require("./user");
