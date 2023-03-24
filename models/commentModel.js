const mongoose=require("mongoose");

const commentSchema=new mongoose.Schema({
    videoId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Video",
        required:true,
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    text:{
        type:String,
        required:true,
    },
    replies:[{type:mongoose.Schema.Types.ObjectId,ref:"Reply"}],
    createdAt:{
        type:Date,
        default:Date.now,
    },
});

const Comment=mongoose.model("Comment",commentSchema);

module.exports=Comment;