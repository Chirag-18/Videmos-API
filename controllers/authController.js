const otpGenerator=require("otp-generator");
const uuid=require("uuid");
const bcrypt=require("bcrypt");
const validator=require("validator");
const jwt=require("jsonwebtoken");
const {Agenda}=require("agenda");

const User=require("../models/userModel");
const emailServices=require("../services/emailServices");
const AppError=require("../utility/appError");
const catchAsync=require("../utility/catchAsync");

require("dotenv").config();

const agenda=new Agenda({ db: {address:process.env.MONGODB_URL}});

exports.signup=catchAsync(async(req,res,next)=>{

    const {firstName,lastName,email,password}=req.body;
    
    const existing=await User.findOne({email});
    if(existing){
        return next(new AppError("Email already exists",400));
    }
    if(!firstName || firstName.length>40){
        return next(new AppError("First Name should not be empty and should be less than 40 chaaracters "));
    }
    if(!lastName || lastName.length>40){
        return next(new AppError("Last Name should not be empty and should be less than 40 chaaracters "));
    }
    if(!password || password.length>20){
        return next(new AppError("Password should not be empty and should be less than 20 chaaracters "));
    }
    if(!validator.default.isEmail(email)){
        return next(new AppError("Email is not valid"));
    }
const normalizedEmail=validator.default.normalizeEmail(email);

const hashedPassword=await bcrypt.hash(password,12);

const username=`@${firstName.toLowerCase()}${uuid.v4().substring(0,8)}`;

const otp=otpGenerator.generate(6,{
    digits:true,
    upperCaseAlphabets:false,
    lowerCaseAlphabets:false,
    specialChars:false,
});

const newUser=new User({
firstName,
lastName,
email:normalizedEmail,
password:hashedPassword,
username,
otp,
optExpiresAt:Date.now() + 10 * 60 * 1000,
});

await newUser.save();

// setTimeout(async () => {
//     const user=await User.findById(newUser._id);

//     if(user && !user.isVerified){
//         await User.deleteOne({ _id : user.id });
//     }
// },10 * 60 * 1000);

agenda.schedule("10 minutes from now","delete unverified user",{
    userId:newUser._id,
});

await emailServices.sendOtpVerificationEmail(normalizedEmail,otp);

res.status(201).json({
    message:"Your account has been created.Please verify it by the Otp sent to your email !",

});

});

exports.verifyAccount = catchAsync(async (req,res,next) => {
    const { otp,email }=req.body;
     
    if(!otp || !email){
        return next(new AppError("Otp or Email cannot be empty"));
    }

    if(!validator.default.isEmail(email)){
        return next(new AppError("Email is invalid"));
    }

    const user=await User.findOne({email});

    if(!user){
        return next(new AppError("No user with this email is found"));
    }

    if(user.otp !== otp || user.optExpiresAt < Date.now()){
        return next (new AppError("OTP is invalid or expires"));
    }

    user.isVerified=true;
    user.otp=null;
    user.optExpiresAt=null;

    await user.save();

    const token=jwt.sign({userId:user._id},process.env.JWT_SECRET);

    res.status(201).json({
        message:"User is verified",
        token:token,
    });

});

exports.login =catchAsync( async (req , res, next) => {
    const {email,password }=req.body;

    if(!email || !password){
    return next (new AppError("Please provide email and password"),400);
    }

    if(!validator.default.isEmail(email)){
        return next(new AppError("Please provide a valid email", 400)); 
    }

    const user=await User.findOne({email});

    if(user.isVerified ===false){
        return next(new AppError("Please verify your account first.", 400));
    }

    if(!user || !(await bcrypt.compare(password,user.password))){
        return next(new AppError("Incorrect email or password", 400));
    }

    const token=jwt.sign({userId :user._id},process.env.JWT_SECRET);

    res.status(200).json({
        message:"You are login successfully",
        token,
    });

});
