const express=require("express");

const userController=require("../controllers/userController");
const authMiddlewares=require("../middlewares/authMiddleware");
const profileUploader=require("../middlewares/profileUploader");

const router=express.Router();

router.route("/update-info").post(authMiddlewares.protect,userController.updateBasicInfo);
router.route("/update-profile").post(authMiddlewares.protect,profileUploader.single("profile"),userController.updateProfile);
router.route("/forget-password-otp").post(userController.forgetPasswordSendOtp);
router.route("/reset-password").post(userController.resetForgetPassword);
router.route("/delete-account").delete(authMiddlewares.protect,userController.deleteAccount);

module.exports=router;