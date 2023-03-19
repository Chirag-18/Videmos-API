const validator = require("validator");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/userModel");
const catchAsync = require("../utility/catchAsync");
const AppError = require("../utility/appError");
const emailServices = require("../services/emailServices.js");

exports.updateBasicInfo = catchAsync(async (req,res,next) => {
   const { firstName,lastName,UserName} = req.body;
    const { id }=req.user;

    const user = await User.findById(_id);
     
    if(!user){
        return next(new AppError("User not found"),400);
    }

    if (!firstName || firstName.length > 40) {
        return next(new AppError("First name should be less then 40."));
      }
    
      if (!lastName || lastName.length > 40) {
        return next(new AppError("Last name should be less then 40."));
      }

      const existingUsername=await User.findOne({userName});

      if(existingUsername){
        return next (new AppError("Username already taken"));
      }

    user.firstName = firstName;
    user.lastName = lastName;
    user.username = userName;

     await user.save();

  res.status(200).json({
    message: "User Information updated Successfully.",
  });
});

exports.forgetPasswordSendOtp = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Email filed can't be empty."));
  }

  if (!validator.default.isEmail(email)) {
    return next(new AppError("Email is not valid."));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError("No User Exists with this email"));
  }

  const otp = otpGenerator.generate(6, {
    digits: true,
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });

  user.otp = otp;
  user.optExpiresAt = Date.now() + 10 * 60 * 1000; // 10 mintues

  await user.save();

  await emailServices.sendOtpVerificationEmail(email, otp);

  res.status(200).json({
    message:
      " We have sent an OTP to your registered email. Please enter the OTP to rest your password in 10 mintues.",
  });
});

exports.resetForgetPassword = catchAsync(async (req, res, next) => {
  const { otp, email, password, confirmPassword } = req.body;

  if (!otp || !email || !password || !confirmPassword) {
    return next(
      new AppError(
        "All fields including OTP field are required to reset password"
      )
    );
  }

  if (!validator.default.isEmail(email)) {
    return next(new AppError("Email is not valid"));
  }

  if (password !== confirmPassword) {
    return next(new AppError("Passwords do not match"));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError("No user Exists with this email"));
  }

  if (user.otp !== otp || user.optExpiresAt < Date.now()) {
    return next(new AppError("OTP is invalid or OTP is expired"));
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  user.password = hashedPassword;
  user.otp = null;
  user.optExpiresAt = null;

  await user.save();

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

  res.status(200).json({
    message: "Password has been successfully reset.",
    token: token,
  });
});
