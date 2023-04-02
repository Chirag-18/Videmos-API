const express=require("express");

const videoController=require("../controllers/videoController");
const authMiddlewares=require("../middlewares/authMiddleware");
const videoUploader=require("../middlewares/videoUploader");

const router=express.Router();

router.route("/upload-video").post(authMiddlewares.protect,
    videoUploader.single("video"),
    videoController.uploadVideo);

router.route("/:id/comment").post(authMiddlewares.protect,videoController.createComment);   

router.route("/:videoId/comment/:commentId/reply")
    .post(authMiddlewares.protect,videoController.createReply);
    
router.route("/:videoId/comment/:commentId/reply/:replyId/reply")
    .post(authMiddlewares.protect,videoController.createChildReply);

router
    .route("/:videoId/comment/:commentId")
    .delete(authMiddlewares.protect,videoController.deleteComment)
    .get(authMiddlewares.protect,videoController.getComment)
    .patch(authMiddlewares.protect,videoController.updateComment);

module.exports=router;