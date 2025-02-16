import mongoose from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"


//  TODO CHANGE ENV SETTINGS

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      unique: true,
      lowercase: true,
      index: true,
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    gender:{
       type: String, 
       required: true, 
       enum: ["MALE","FEMALE","OTHER"]
    },
    avatar: {
      type: String,
      required: false,
    },
    coverImage: {
      type: String,
      required: false,
    },
    videos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    bio:{
        type:String,
        required:false,
        trim:true
    },
    password: {
      type: String,
      required: true,
    },
    refreshtoken: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password,10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password:string){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            id: this._id
        },
        "hfyuffvfu",
        {
            expiresIn: "1d",
        }
    )
} 

userSchema.methods.generateRefreshToken = function(){
  return jwt.sign(
      {
          id: this._id
      },
      "hfyuffvfu",
      {
          expiresIn: "10d",
      }
  )
}

const User = mongoose.model("User", userSchema);

export default User;
 