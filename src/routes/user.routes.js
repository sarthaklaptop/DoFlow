import {Router, json} from "express";

import {loginUser, logoutUser, registerUser} from '../controllers/user.controller.js'

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createTodo } from "../controllers/todo.controller.js";

const router = Router()

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)

// secured Routes
router.route("/logout").post(verifyJWT, logoutUser)

// secured routes for todo
router.route("/todo/create").post(verifyJWT, createTodo)




export default router