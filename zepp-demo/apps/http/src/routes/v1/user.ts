import { Router } from "express";
import { userMiddleware } from "../../middleware/user";
import { updateMetaverseSchema } from "../../types";
import prismaClient from "@zepp-demo/db/client"

export const userRouter = Router();

userRouter.post('/metadata', userMiddleware, async (req,res) => {
    const parsedData = updateMetaverseSchema.safeParse(req.body)
    if(!parsedData.success){
        res.status(400).json({message : "Validation failed"})
        return
    }
    await prismaClient.user.update({
        where: {
            id : req.userId
        },
        data: {
            avatarId: parsedData.data.avatarId
        }
    })
    res.json({message: "Metadata provided"})    
})

userRouter.post('/metadata/bulk', async (req,res) => {
    const userString = (req.query.ids ?? "[]") as string;
    const userIds = (userString).slice(1, userString?.length - 2).split(",");

    const metadata = await prismaClient.user.findMany({
        where: {
            id: {
                in: userIds
            }
        }, select : {
            avatar : true,
            id:true
        }
    })

    res.json({
        avatars: metadata.map(m => ({
            userId: m.id,
            avatarId: m.avatar?.imageUrl
        }))
    })
})