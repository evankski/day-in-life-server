const express = require("express");
const router = express.Router();
const multer = require("multer");
const requiresToken = require("./requiresToken");

const cloudinary = require("cloudinary").v2;

const { unlinkSync } = require("fs");
const { db } = require("../../models/user");

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

router.get("/:id", async (req, res) => {
  try {
    const photId = await db.user.photos.public_id;
    const cloudImage = `https://res.cloudinary.com/dhs1wrqhp/image/upload/v1593119998/${photId}.png`;
    res.status(200).json({ cloudImage });
  } catch (err) {
    console.log(err);
  }
});

router.put("/:id", requiresToken, async (req, res) => {
  try {
    if (req.body.user_id === res.locals.user.id) {
      const photo = await db.users.photos.findOneAndUpdate({
        caption: req.body.caption,
      });
    }
    res.status(202).json({ msg: "the caption has been updated" });
  } catch (err) {
    console.log(err);
  }
});

router.delete("/:id", requiresToken, async (req, res) => {
  try {
    if (req.body.user_id === res.locals.user.id) {
      const photo = await db.users.photos.remove({});
    }
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
