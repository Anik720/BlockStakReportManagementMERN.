const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
//  Protecting Routes
module.exports = catchAsync(async (req, res, next) => {
  // 1- get the token check if exist
  //   const token=req.header('Authorization').replace('Bearer ','')
  let token;
  console.log(req.headers.authorization === true);
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
    console.log(token);
  }
  if (!token) {
    return next(new AppError("you are not login ", 401));
  }
  console.log(`process.env.JWT_SECRET`, process.env.JWT_SECRET);
  // 2- validate the token
  let decode;
  try {
    decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(new AppError("Token Expired ", 401));
  }

  // 3- check user exits
  const currentUser = await User.findById(decode.id);
  if (!currentUser) {
    return next(
      new AppError("the user belong to this token does not exists ", 401)
    );
  }

  req.user = currentUser;
  next();
});
