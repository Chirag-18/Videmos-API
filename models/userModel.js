const mongoose=require("mongoose");
const validator=require("validator");

const userSchema=new mongoose.Schema({
    firstName:{
     type:String,
     required:[true,"First Name is required"],
     trim:true,
    },
    lastName:{
     type:String,
     required:[true,"Last Name is required"],
     trim:true,
    },
    email:{
        type:String,
        require:[true,"Email is required"],
        unique:true,
        validate:{
            validator:(value)=>{
                return validator.default.isEmail;
            },
        },
    },
    password:{
        type:String,
        required:[true,"Password is required"],
        trim:true,
    },
    username:{
        type:String,
        required:true,
        unique:true,
    },
    profile:{
        type:String,
        default:null,
    },
    otp:{
        type:String,
        default:null,
    },
    optExpiresAt:{
        type:Date,
        default:null,
    },
    isVerified:{
        type:Boolean,
        default:false,
    },
    uploadedVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
    commented:[{type:mongoose.Schema.Types.ObjectId, ref:"Comment"}],
    commentReplied:[{type:mongoose.Schema.Types.ObjectId, ref:"Reply"}],
    replyReplied:[{type:mongoose.Schema.Types.ObjectId, ref:"Reply"}],
    createdAt:{
        type:Date,
        default:Date.now(),
    },


});

const User=mongoose.model("User",userSchema);

module.exports=User;