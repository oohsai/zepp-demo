import { Router } from "express";
import { addElementSchema, createElementSchema, createSpaceSchema, DeleteElementSchema } from "../../types";
import prismaClient from "@zepp-demo/db/client"
import { userMiddleware } from "../../middleware/user";

export const spaceRouter = Router();

spaceRouter.post('/', async (req,res) => {
    const parsedData = createSpaceSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(400).json({message: "Validation failed"})
        return
    }

    if(!parsedData.data.mapId){
        await prismaClient.space.create({
            data: {
                name: parsedData.data.name,
                width: Number(parsedData.data.dimensions.split("x")[0]),
                height: Number(parsedData.data.dimensions.split("x")[1]),
                creatorId: req.userId!
            }
        });
        res.json({message: "Space Created"})
    }

    const map = await prismaClient.map.findUnique({
        where: {
            id: parsedData.data.mapId
        }, select: {
            mapElements:true,
            width:true,
            height:true
        }
    })
    if(!map) {
        res.status(400).json({message: "Map not found"})
        return
    }
    let  space = await prismaClient.$transaction(async () => {
        const space = await prismaClient.space.create({
            data: {
                name: parsedData.data.name,
                width: map.width,
                height: map.height,
                creatorId: req.userId!
            }
        })

        await prismaClient.spaceElements.createMany({
            data: map.mapElements.map(e => ({
                spaceId: space.id,
                elementId: e.elementId,
                x: e.x!,
                y: e.y!
            }))
        })
        return space;
    })
    res.json({spaceId: space.id})
})

spaceRouter.delete('/:spaceId', userMiddleware, async (req,res) => {
    const space = await prismaClient.space.findUnique({
        where: {
            id:req.params.spaceId
        }, select: {
            creatorId: true
        }
    })

    if(!space) {
        res.status(404).json({message: "Space not found"})
        return
    }

    if(space.creatorId !== req.userId) {
        res.status(403).json({message: "Unauthorized"})
        return
    }

    await prismaClient.space.delete({
        where: {
            id: req.params.spaceId
        }
    })
    res.json({message: "Space deleted"})
})

spaceRouter.get('/all', userMiddleware, async (req,res) => {
    const spaces = await prismaClient.space.findMany({
        where: {
            creatorId: req.userId!
        }
    });

    res.json({
        spaces: spaces.map(s => ({
            id: s.id,
            name: s.name,
            thumbnail: s.thumbnail,
            dimensions: `${s.width}x${s.height}`,
        }))
    })
})

spaceRouter.post('/element', userMiddleware, async (req,res) => {
    const parsedData = addElementSchema.safeParse(req.body)
    if(!parsedData.success){
        res.status(400).json({message: "Validation failed"})
        return
    }
    const space = await prismaClient.space.findUnique({
        where: {
            id: req.body.spaceId,
            creatorId:req.userId!
        }, select: {
            width: true,
            height: true,
        }
    })

    if(!space){
        res.status(400).json({message: "Space not found"})
        return
    }

    await prismaClient.spaceElements.create({
        data: {
            spaceId : req.body.spaceId,
            elementId: req.body.elementId,
            x: req.body.x,
            y: req.body.y
        }
    })
    res.json({message: "Element added"})
})

spaceRouter.delete('/element', userMiddleware, async (req,res) => {
    const parsedData = await DeleteElementSchema.safeParse(req.body)
    if(!parsedData.success){
        res.status(400).json({message: "Validation failed"})
        return
    }
    const spaceElement =  await prismaClient.spaceElements.findFirst({
        where: {
            id: parsedData.data.id
        }, include : {
            space: true
        }
    })
    if(!spaceElement?.space.creatorId || spaceElement.space.creatorId !== req.userId){
        res.status(403).json({message: "Unauthorized"})
        return
    }
    await prismaClient.spaceElements.delete({
        where: {
            id: parsedData.data.id
        }
    })
    res.json({message: "Element deleted"})
})

spaceRouter.get('/:spaceId', async (req,res) => {
    const space = await prismaClient.space.findUnique({
        where: {
            id:req.params.spaceId
        },
        include: {
            spaceElements: {
                include: {
                    element: true
                }
            }
        }
    })

    if(!space) {
        res.status(400).json({message: "Space not found!"})
        return
    }
    res.json({
        "dimensions": `${space.width}x${space.height}`,
        elements: space.spaceElements.map(e => ({
            id: e.id,
            element: {
                id: e.element.id,
                imageUrl: e.element.imageUrl,
                width: e.element.width,
                height: e.element.height,
                static: e.element.static
            },
            x: e.x,
            y: e.y
        }))
    })
})