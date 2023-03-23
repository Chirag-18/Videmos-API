const uuid=require("uuid");
const cloudinary=require("cloudinary").v2;
const streamifier=require("streamifier");

const Video=require("../models/videoModel");
const User=require("../models/userModel");
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