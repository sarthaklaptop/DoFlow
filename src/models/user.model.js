import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";

import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
    {
        firstName:{
            type: String,
            required: true,
            trim: true,
            // index : true makes searching more reliable 
            index: true
        },
        lastName:{
            type: String,
            required: true,
            trim: true,
            // index : true makes searching more reliable 
            index: true
        },
        email:{
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        avatar:{
            type: String, // Generate Image with first initials of first name and last name
            required: true,
        },
        refreshToken: {
            type: String
        },
        todo: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Todo"
            }
        ]
    },
    {
        timestamps: true
    }

)

userSchema.pre("save", async function (next) {

    if(!this.isModified("password")) return next;

    this.password = await bcrypt.hash(this.password, 10)

    next()
})

userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = async function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = async function() {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }

    )
}

export const User = mongoose.model("User", userSchema)