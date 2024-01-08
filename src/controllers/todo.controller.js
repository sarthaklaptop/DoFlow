import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Todo } from "../models/todo.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";

const createTodo = asyncHandler ( async (req, res) => {

    // take data
    // validate data
    // create entry in db
    // check todo creation
    // return response

    const {title, description} = req.body;

    // validation

    if (!title){
        throw new ApiError (400, "Todo title is required")
    }

    const userId = req.user?._id;

    console.log(userId)

    const todo = await Todo.create({
        user : userId,
        title,
        description
    })

    const createdTodo = await Todo.findById(todo?._id)

    console.log(createdTodo)

    await User.findByIdAndUpdate(
        userId,
        { $push: { todo: todo._id} },
        { new: true}
    );

    return res.status(201)
    .json( new ApiResponse(200, createTodo, "Todo Created Successfully"))
})

// get all todos
// update todo
// delete todo


export {
    createTodo
}