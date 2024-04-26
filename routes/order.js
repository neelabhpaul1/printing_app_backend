const express = require("express");
const fs = require("fs");
const router = express.Router();
const multer = require("multer");
const { order, updateOrder } = require("../controllers/order");

const createFolder = (req, res, next) => {
  const path = "./files";
  fs.mkdir(path, (error) => {
    if (error) {
      next();
    } else {
      next();
    }
  });
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./files");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname.replace(/\s+/g, "_").toLowerCase());
  },
});

const upload = multer({ storage: storage });

router.post("/", createFolder, upload.single("file"), order);
router.post("/update", updateOrder);

module.exports = router;
