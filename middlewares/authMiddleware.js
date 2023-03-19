const jwt=require("jsonwebtoken");

const User=require("../models/userModel");
const catchAsync=require("../utility/catchAsync");
const AppError=require("../utility/appError");

exports.protect= catchAsync(async (req,res,next) => {
    const authHeader=req.headers.authorization;

    if(!authHeader || !authHeader,startsWith("Bearer")){
        return next(new AppError("Unauthorised! login or Signup first",400));
    }

    const token=authHeader.split(" ")[1];

    const decoded=jwt.verify(token,process.env.JWT_SECRET);

    const user= await User.findOne({_id : decoded.userId});
    
    if(!user){
        return next(new AppError("User not found",401));
    }

    if(user.isVerified === false){
        return next(new AppError("User is not verified",400));
    }

    req.user=user;
    next();
});