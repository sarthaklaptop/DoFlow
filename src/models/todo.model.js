import mongoose, {Schema} from "mongoose";



const todoSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
        }
    },
    {
        timestamps: true
    }
)


export const Todo = mongoose.model("Todo", todoSchema)