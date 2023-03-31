const mongoose=require("mongoose");

const replySchema=new mongoose.Schema({
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        require:true,
    },
    text:{
        type:String,
        required:true,
    },
    videoId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Video",
        required:true,
    },
    childReplies:[{type:mongoose.Schema.Types.ObjectId,ref:"Reply"}],
    parentComment:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Comment",
    },
    parentReply:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Reply",
    },
    createdAt:{
        type:Date,
        default:Date.now,
    },

});

const Reply=mongoose.model("Reply",replySchema);

module.exports=Reply;