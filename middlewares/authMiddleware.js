const jwt = require("jsonwebtoken");

const User = require("../models/userModel");
const catchAsync = require("../utility/catchAsync");
const AppError = require("../utility/appError");

exports.protect = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return next(new AppError("Unauthorized! Login or Signup first.", 400));
  }

  const token = authHeader.split(" ")[1];

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findOne({ _id: decoded.userId }).select(
    "_id firstName lastName username"
  );

  if (!user) {
    return next(new AppError("User not found", 401));
  }

  if (user.isVerified === false) {
    return next(new AppError("User is not verfied", 400));
  }

  req.user = user;
  next();
});
