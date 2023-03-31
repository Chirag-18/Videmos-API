const uuid=require("uuid");
const cloudinary=require("cloudinary").v2;
const streamifier=require("streamifier");

const Video=require("../models/videoModel");
const User=require("../models/userModel");
const Comment=require("../models/commentModel");
const Reply=require("../models/replyModel");
const catchAsync=require("../utility/catchAsync");
const AppError=require("../utility/appError");

// Cloudinary Config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUDNAME,
    api_key: process.env.CLOUDINARY_APIKEY,
    api_secret: process.env.CLOUDINARY_APISECRET,
  });

exports.uploadVideo = catchAsync(async (req,res,next) => {
    const {_id }=req.user;
    const videoToUpload=req.file;
    const { title,description ,category }=req.body;

    if(!videoToUpload){
        return next (new AppError("Please upload a file",400));
    }

    const user=await User.findById(_id);

    if(!user){
    return next(new AppError("Invalid account login or signup first"));
    }

    const videoName=`${user._id}-${uuid.v4()}-${Date.now()}-${videoToUpload.originalname}`;

    const cloudinaryStream=cloudinary.uploader.upload_stream({
        folder:"Dev",
        public_id:videoName,
        resource_type:"video",
        chunk_size:60000000,
    },
    async(error,result)=>{
        if(error){
            console.log(error);
            return next(new AppError("Error upload video", 500));
        }else{
            const video=new Video({
                title,
                description,
                category,
                uploadedBy:user._id,
                fileUrl:result.secure_url,
            });
            JSON.parse(req.body.keywords).forEach((keyword) =>{
                video.keywords.push(keyword);
            });

            await video.save();

            user.uploadedVideos.push(video._id);
            await user.save();

            res.status(201).json({
                status:"success",
                message:"video has been uploaded",
                data:{
                    video,
                },
            });
        }
    }
    );
    streamifier.createReadStream(videoToUpload.buffer).pipe(cloudinaryStream);
});

exports.createComment = catchAsync(async (req, res, next) => {
  const { _id } = req.user;
  const videoId = req.params.id;

  const video = await Video.findById(videoId);
  const user = await User.findById(_id);

  if (!video) {
    return next(new AppError("Video not found with this Id", 400));
  }

  const { text } = req.body;

  if (text.length <= 0) {
    return next(new AppError("Comment text length cann't be null", 400));
  }

  const newComment = await Comment.create({
    videoId: videoId,
    author: _id,
    text: text,
  });

  video.comments.push(newComment._id);
  user.commented.push(newComment._id);

  await video.save();
  await user.save();

  res.status(201).json({
    status: "success",
    data: newComment,
  });
});

exports.createReply = catchAsync(async(req,res,next) => {
    const  { _id }=req.user;
    const videoId=req.params.videoId;
    const commentId=req.params.commentId;
    const {text}=req.body;

    const video=await Video.findById(videoId);
    const comment=await Comment.findById(commentId);
    const user=await User.findById(_id);

     if (!video) {
    return next(new AppError("Video not found with this Id", 400));
    }

    if (!comment) {
    return next(new AppError("Comment not found with this Id", 400));
    }

    if(!video.comments.includes(commentId)){
      return next (new AppError("Cooment and video are not related",400));
    }
    const reply= await Reply.create({
      author:_id,
      text:text,
      videoId:videoId,
      parentComment:commentId,
      parentReply:null,
    });
    comment.replies.push(reply._id);
    user.commentReplied.push(reply._id);

    await comment.save();
    await user.save();

    res.status(201).json({
      status: "success",
      data: reply,
    });
});

exports.createChildReply =catchAsync(async( req,res,next) => {
    const {_id} =req.user;
    const videoId=req.params.videoId;
    const commentId=req.params.commentId;
    const replyId=req.params.replyId;
    const {text} =req.body;

    const user=await User.findById(_id);
    const video=await Video.findById(videoId);
    const comment=await Comment.findById(commentId);
    const reply=await Reply.findById(replyId);
    if (!video) {
      return next(new AppError("Video not found with this Id", 400));
    }
  
    if (!comment) {
      return next(new AppError("Comment not found with this Id", 400));
    }
  
    if (!reply) {
      return next(new AppError("Reply not found with this Id", 400));
    }

    if(!video.comments.includes(commentId)){
      return next(new AppError("video and comment are not related",400));
    }
    if(!comment.replies.includes(replyId)){
      return next(new AppError("comment and reply are not related",400));
    }

    const childReply=await Reply.create({
      author:_id,
      text: text,
      videoId: videoId,
      parentComment: commentId,
      parentReply: replyId,
    });

    reply.childReplies.push(childReply._id);
    user.replyReplied.push(childReply._id);

    await reply.save();
    await user.save();

    res.status(201).json({
      status: "success",
      data: childReply,
    });
});