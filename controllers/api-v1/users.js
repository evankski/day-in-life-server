const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../../models");
const requiresToken = require("./requiresToken");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { unlinkSync } = require("fs");
const newPics = multer({ dest: "uploads/" });

// GET /users -- READ all users and their subdocs
router.get("/", async (req, res) => {
  try {
    const allUsers = await db.User.find({});
    res.json(allUsers);
  } catch (err) {
    console.log(err);
    res.status(503).json({ msg: "server error" });
  }
});

// GET /users/:id -- READ user document with :id and its subdocs
router.get("/:id", requiresToken, async (req, res) => {
  // console.log(req.params);
  try {
    const foundUser = await db.User.findById(req.params.id);
    // console.log(foundUser)
    if (!foundUser) return res.status(404).json({ msg: "user not found" });
    res.json(foundUser);
  } catch (err) {
    console.log(err);
    res.status(503).json({ msg: "server error" });
  }
});

//POST /users/register -- CREATE a new user
router.post("/register", async (req, res) => {
  try {
    // check if the user exists already
    const userCheck = await db.User.findOne({
      email: req.body.email,
    });

    if (userCheck)
      return res.status(409).json({
        msg: "user already exists",
      });
    // hash the pass
    const salt = 12;
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    // create a user in the db
    console.log(hashedPassword);
    const newUser = await db.User.create({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });
    // create a jwt payload to send back to client
    const payload = {
      name: newUser.name,
      email: newUser.email,
      id: newUser.id,
    };
    // sign the jwt and send it
    const token = await jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: 600 * 60,
    });
    res.json({ token });
  } catch (err) {
    console.log(err);
    res.status(503).json({ msg: "server error" });
  }
});

// POST /user/login -- validate login crednetials
router.post("/login", async (req, res) => {
  // try to find the user in the db
  try {
    const foundUser = await db.User.findOne({
      email: req.body.email,
    });
    // if the user isn't found -- send a message back
    if (!foundUser)
      return res.status(400).json({
        msg: "invalid login credentials",
      });
    // check the req.body against the password i the db
    const matchedPasswords = await bcrypt.compare(
      req.body.password,
      foundUser.password
    );
    console.log(matchedPasswords);
    // if the provided info does not match -- send back an error and return
    if (!matchedPasswords)
      return res.status(400).json({ msg: "invalid login credentials" });
    // create a jwt payload
    const payload = {
      name: foundUser.name,
      email: foundUser.email,
      id: foundUser.id,
    };
    // sign the jwt
    const token = await jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: 600 * 60,
    });
    // send it back
    res.json({ token });
  } catch (err) {
    console.log(err);
  }
});

// PUT /users/:id -- UPDATE user profile photo
router.put("/:id", newPics.single("image"), requiresToken, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: "no file uploaded" });
    const cloudinaryImageData = await cloudinary.uploader.upload(req.file.path);
    console.log(cloudinaryImageData);
    await db.User.findByIdAndUpdate(req.params.id, {
      profile_url: cloudinaryImageData.public_id,
    });
    unlinkSync(req.file.path);
    res.status(201).json({ msg: "upload success" });
  } catch (err) {
    console.log(err);
    res.status(503).json({ msg: "you should look at the server console" });
  }
});

// DELETE /users/:id -- DESTROY user document with :id and its subdocs
router.delete("/:id", requiresToken, async (req, res) => {
  try {
    const foundUser = await db.User.findById(req.params.id);
    if(res.locals.user.id === foundUser.id) {
      foundUser.remove();
      res.status(200).json({ msg: "user successfully deleted" });
    } else res.json({ msg: 'invalid action' })
  } catch (err) {
    console.log(err);
    res.status(503).json({ msg: "database or server error" });
  }
});

module.exports = router;
