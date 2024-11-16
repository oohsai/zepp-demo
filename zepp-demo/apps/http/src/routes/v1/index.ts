import e, { Router } from "express";
import { userRouter } from "./user";
import { spaceRouter } from "./space";
import { adminRouter } from "./admin";
import prismaClient from "@zepp-demo/db/client"
import jwt from "jsonwebtoken"
import { JWT_PASSWORD } from "../../config";
import { compare, hash } from "../../scrypt";
import { SignInSchema, SignUpSchema } from "../../types";

export const router = Router();

router.post('/signin', async (req,res) => {
    const parsedData = await SignInSchema.safeParse(req.body)

    if(!parsedData.success) {
        res.status(403).json({message: "Signin failed."})
        return
    }

    try {
        const user = await prismaClient.user.findUnique({
            where: {
                username : parsedData.data.username
            }
        })
        if(!user) {
            res.status(403).json({message: "User not found"})
            return
        }
        const isValid = await compare(parsedData.data.password, user.password)
        if(!isValid) {
            res.status(403).json({message: "Invalid Password"})
            return 
        }

        const token = jwt.sign({
            userId: user.id,
            role: user.role
        }, JWT_PASSWORD);
        res.json({
            token
        })
    } catch (error) {
        res.status(400).json({message: "Signin failed"})
    }
})

router.post('/signup', async  (req,res) => {
    const parsedData = await SignUpSchema.safeParse(req.body)
    if(!parsedData.success) {
        res.status(400).json({message: "SignUp failed.Resend correct"})
        console.log(parsedData);
        return
    }

    const hashedPassword = await hash(parsedData.data.password)

    try {
        const user = await prismaClient.user.create({
            data: {
                username: parsedData.data.username,
                password : hashedPassword,
                role : parsedData.data.role === "admin" ? "Admin" : "User"
            }
        })
        res.json({
            userId : user.id
        })
    } catch (error) {
        console.log(error);
        res.status(400).json({message: "User already exists!"})
    }
    
})

router.get('/elements', async (req,res) => {
    const elements = await prismaClient.element.findMany()
    res.json({
        elements: elements.map(x => ({
            id: x.id,
            imageUrl: x.imageUrl,
            width: x.width,
            height: x.height,
            static: x.static
        }))
    })
})

router.get('/avatars', async (req,res) => {
    const avatars = await prismaClient.avatar.findMany()
    res.json({
        avatars: avatars.map(x => ({
            id: x.id,
            imageUrl: x.imageUrl,
            name: x.name
        }))
    })
})

router.use('/user', userRouter);
router.use('/space', spaceRouter);
router.use('/admin', adminRouter);