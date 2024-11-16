import { Router } from "express";
import { addElementSchema, createAvatarSchema, createElementSchema, createMapSchema, updateElementSchema } from "../../types";
import { adminMiddleware } from "../../middleware/admin";
import prismaClient from "@zepp-demo/db/client"

export const adminRouter = Router();

adminRouter.post('/element',adminMiddleware,  async(req,res) => {
    const parsedData = await createElementSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(400).json({message: "Check content! Validation failed"})
        return
    }
    
    const element = await prismaClient.element.create({
        data: {
            name: parsedData.data.name,
            width: Number(parsedData.data?.width),
            height: Number(parsedData.data?.height),
            static: parsedData.data.static,
            imageUrl: parsedData.data.imageUrl
        }
    })

    res.json({id: element.id,message: "Element created"})
    
})

adminRouter.put('/element/:elementId',adminMiddleware, async (req,res) => {
    const parsedData = await updateElementSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(400).json({message: "Check content! Validation failed"})
        return
    }
    prismaClient.element.update({
        where: {
            id: req.params.elementId
        },
        data: {
            imageUrl: parsedData.data.imageUrl
        }
    })

    res.status(200).json({message: "Element updated"})
})

adminRouter.post('/avatar', async (req,res) => {
    const parsedData = await createAvatarSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(400).json({message: "Check content! Validation failed"})
        return
    }
    const avatar = await prismaClient.avatar.create({
        data: {
            name: parsedData.data.name,
            imageUrl: parsedData.data.imageUrl
        }
    })
    res.json({id: avatar.id})
})

adminRouter.post('/map', async (req,res) => {
    const parsedData = await createMapSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(400).json({message: "Check content! Validation failed"})
        return
    }
    const maps = await prismaClient.map.create({
        data: {
            name: parsedData.data.name,
            width:Number(parsedData.data.dimensions.split("x")[0]),
            height:Number(parsedData.data.dimensions.split("x")[1]),
            thumbnail:parsedData.data.thumbnail,
            mapElements: {
                create: parsedData.data.defaultElements.map(e => ({
                    elementId: e.elementId,
                    x: e.x,
                    y: e.y
                })
                )
            }
        }
    })
    res.json({
        id: maps.id
    })
})