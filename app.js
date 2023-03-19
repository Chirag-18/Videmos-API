const express=require("express");
const mongoose=require("mongoose");

const authRoutes=require("./routers/authRoutes");
const userRoutes=require("./routers/userRoutes");
const globalErrorHandler=require("./middlewares/globalErrorHandler");

require("dotenv").config();

const app=express();
app.use(express.json());
app.use(express.urlencoded({extended :true}));


mongoose
 .connect(process.env.MONGODB_URL)
 .then(()=>{
    console.log("Database is connected");
}).catch((err)=>{
    console.log(err);
});

app.use("/auth",authRoutes);
app.use("/users",userRoutes);

app.use(globalErrorHandler);

module.exports=app;