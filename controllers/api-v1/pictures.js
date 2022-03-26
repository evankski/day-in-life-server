const express = require("express");
const router = express.Router();
const multer = require("multer");
const requiresToken = require("./requiresToken");

const cloudinary = require("cloudinary").v2;

const { unlinkSync } = require("fs");

const db = require("../../models");

const newPics = multer({ dest: "uploads/" });

router.post("/", newPics.single("image"), requiresToken, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: "no file uploaded" });
    const cloudinaryImageData = await cloudinary.uploader.upload(req.file.path);
    console.log(cloudinaryImageData);
    const foundUser = res.locals.user;
    // const cloudImage = `https://res.cloudinary.com/dhs1wrqhp/image/upload/v1593119998/${cloudImageData.public_id}.png`;
    foundUser.photos.push({
      public_id: cloudinaryImageData.public_id,
      caption: req.body.caption,
    });
    await foundUser.save();
    unlinkSync(req.file.path);
    // res.json({ cloudImage });
    res.status(201).json({ msg: "image posted to db" });
  } catch (err) {
    console.log(err);
    res.status(503).json({ msg: "you should look at the server console" });
  }
});

router.get("/:id", requiresToken, async (req, res) => {
  try {
    const foundUser = await db.User.findOne({
: "database or server error" });
      'photos._id': req.params.id,
  })
    const foundPhoto = foundUser.photos.id(req.params.id)
    console.log(foundPhoto)
    res.status(200).json(foundPhoto)
  } catch (err) {
    console.log(err);
    res.status(503).json({msg: 'database or server error'})
  }
});

router.put("/:id", requiresToken, async (req, res) => {
  try {
    const foundUser = await db.User.findOne({
      "photos._id": req.params.id,
    });
    const foundPhoto = foundUser.photos.id(req.params.id);
    if (foundUser.id === res.locals.user.id) {
      foundPhoto.caption = req.body.caption;
      await foundUser.save();
      res.status(200).json(foundUser);
    } else res.json({ msg: "invalid action" });
  } catch (err) {
    console.log(err);
    res.status(503).json({ msg: "database or server error" });
  }
});

router.delete("/:id", requiresToken, async (req, res) => {
  try {
    const foundUser = await db.User.findOne({
      "photos._id": req.params.id,
    });
    const foundPhoto = foundUser.photos.id(req.params.id);
    if (foundUser.id === res.locals.user.id) {
      foundPhoto.remove();
      await foundUser.save();
      res.status(200).json({ msg: "photo successfully deleted" });
    } else res.json({ msg: "invalid action" });
  } catch (err) {
    console.log(err);
    res.status(503).json({ msg: "database or server error" });
  }
});

module.exports = router;
