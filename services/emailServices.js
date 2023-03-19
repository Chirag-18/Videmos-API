const nodemailer = require("nodemailer");

require("dotenv").config();

var transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    }
  });

exports.sendOtpVerificationEmail=async(email,otp) => {
    try{
        const info=await transporter.sendMail({
            from:"goel.chirag20@gmail.com",
            to:email,
            subject:"Verify your account",
            text:`Your verification code is ${otp}`,
            html:`Your verification code is <b> ${otp} </b>`, 
        });
    }catch (err){
        console.log(err);
    }
};