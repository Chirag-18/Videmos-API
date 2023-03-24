const express=require("express");

const videoController=require("../controllers/videoController");
const authMiddlewares=require("../middlewares/authMiddleware");
const videoUploader=require("../middlewares/videoUploader");

const router=express.Router();

router.route("/upload-video").post(authMiddlewares.protect,
    videoUploader.single("video"),
    videoController.uploadVideo);

router.route("/:id/comment").post(authMiddlewares.protect,videoController.createComment);   

module.exports=router;