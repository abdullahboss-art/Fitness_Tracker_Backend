const express = require("express");
const multer = require("multer");

const authMiddleware = require("../Middleware/authMiddleware");
const UserController = require("../Controller/UserController");

const router = express.Router();

// Multer setup for profile image
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });


router.post("/register", upload.single("profilePic"), UserController.register);
router.post("/login", UserController.login);
router.get("/profile", authMiddleware, UserController.getProfile);
router.put("/update/:id", authMiddleware, upload.single("profilePic"), UserController.updateProfile);

module.exports = router;