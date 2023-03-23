const mongoose=require("mongoose");

const videoSchema=new mongoose.Schema({
    title:{
        type:String,
        require:true,
    },
    description:{
        type:String,
        required:true,
    },
    keywords: {
        type: [String],
        required: true,
      },
      category: {
        type: String,
        default: "entertainment",
        enum: [
          "entertainment",
          "music",
          "gaming",
          "news",
          "sports",
          "travel",
          "education",
          "cooking",
          "comedy",
          "pets",
          "science",
          "tech",
          "housing",
          "howto",
        ],
      },
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      fileUrl: {
        type: String,
        required: Date.now,
      },
      likes: {
        type: Number,
        default: 0,
      },
      dislike: {
        type: Number,
        default: 0,
      },
      views: {
        type: Number,
        default: 0,
      },
});

const Video=mongoose.model("Video",videoSchema);

module.exports=Video;
