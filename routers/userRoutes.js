const express=require("express");

const userController=require("../controllers/userController");
const authMiddlewares=require("../middlewares/authMiddleware");

const router=express.Router();

router.route("/update-info").post(userController.updateBasicInfo);
router.route("/forget-password-otp").post(userController.forgetPasswordSendOtp);
router.route("/reset-password").post(userController.resetForgetPassword);

module.exports=router;