const multer=require("multer");

const AppError=require("../utility/appError");
const catchAsync=require("../utility/catchAsync");

const storage=multer.memoryStorage();

const multerFilter=(req,file,cb) => {
    if(file.mimetype.startsWith("image")){
        cb(null,true);
    }
    else{
        cb(new AppError("Please Upload image only",400),false);
    }

};

const upload=multer({
    storage:storage,
    fileFilter:multerFilter,
    limits:{fileSize:5 * 1024 * 1024},
});

module.exports=upload;