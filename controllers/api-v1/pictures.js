const express = require("express");
const router = express.Router();
// multipart form data packages
const multer = require("multer");

const cloudinary = require("cloudinary").v2;

const { unLinkSync } = require("fs");

const newPics = multer({ dest: "/pictures" });

router.post("/", newPics.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: "no file uploaded" });
    const cloudinaryImageData = await cloudinary.uploader.upload(req.file.path);
    console.log(cloudinaryImageData);
    // cloudImageData.public_id is what you want in the database
    const cloudImage = `https://res.cloudinary.com/dhs1wrqhp/image/upload/v1593119998/${cloudImageData.public_id}.png`;
    // delete the file som it doesn't clutter up the server
    unLinkSync(req.file.path);
    res.json({ cloudImage });
  } catch (err) {
    console.log(
      err.status(503).json({ msg: "you should look at the server console" })
    );
  }
});

router.get("/:id", async (req, res) => {
  try {
    console.log(await db.photo.findOne());
    const photos = await db.photo.findOne({
      //   url:
    });
    res.json({ cloudImage });
  } catch (err) {
    console.log(err);
  }
});

router.put("/:id", async (req, res) => {
  try {
    console.log(await db.photo.findOne());
    const pictures = await db.photo.caption.updateOne({});
    res.json({ cloudImage });
  } catch (err) {
    console.log(err);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    console.log(await db.photo.findOne());
    const pictures = await db.photo.remove({});
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
