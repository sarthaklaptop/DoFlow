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

    // console.log(createdTodo)

    await User.findByIdAndUpdate(
        userId,
        { $push: { todo: todo._id} },
        { new: true}
    );

    return res.status(201)
    .json( new ApiResponse(200, createTodo, "Todo Created Successfully"))
})

// update todo
const updateTodo = asyncHandler ( async (req, res) => {    
    const {title, description} = req.body

    if(!title || !description) {
        throw new ApiError(401, "All fields are required")
    }
    
    const todoId = await req.params._id
    
    console.log("Printing todo in update",todoId)

    const updatedTodo = await Todo.findByIdAndUpdate(
        todoId,
        {
            // this $set will update given fields to new fields 
            $set: {
                title,
                description
            }
        },
        {new:true}
    )

    console.log("Printing updated todo")
    // console.log(updateTodo)

    return res
    .status(200)
    .json( new ApiResponse(200, updateTodo, "Todo Updated Successfully"))
})  


// delete todo

const deleteTodo = asyncHandler ( async (req, res) => {
    // get todo id
    const todoId = await req.params._id

    console.log(todoId)
    // match id from bd

    const deleteTodo = await Todo.findByIdAndDelete(todoId, {new: true})
    // delete todo

    // return response
    return res
    .status(200)
    .json( new ApiResponse(200, {deleteTodo}, "Todo Deleted Successfully"))
})

// get all todos
const getAllTodos = asyncHandler ( async (req, res) => {
    // get the user of which todo you want to get
    const userId = req.user?._id;

    console.log(userId)

    // get todos
    const user = await User.findById( userId ).populate('todo').select(
        "-password -refreshToken -avatar -_id -firstName -lastName"
    )

    // console.log(user)

    if(!user){
        throw new ApiError(404, 'User not found');
    }

    // const userTodos = user;

    // console.log(updateTodo)


    // return response

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Todos Retrieved Successfully"));


})

export {
    createTodo,
    updateTodo,
    deleteTodo,
    getAllTodos
}