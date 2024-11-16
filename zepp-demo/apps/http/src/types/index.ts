import z from "zod"

export const SignUpSchema = z.object({
    username : z.string().email(),
    password : z.string().min(8),
    role : z.enum(["user", "admin"])
})

export const SignInSchema = z.object({
    username : z.string().email(),
    password : z.string().min(8),
})

export const updateMetaverseSchema = z.object({
    avatarId: z.string()
})

export const createSpaceSchema = z.object({
    name: z.string(),
    dimensions: z.string().regex(/^[0-9]{1,4}x[0-9]{1,4}$/),
    mapId: z.string()
})

export const addElementSchema = z.object({
    spaceId : z.string(),
    elementId: z.string(),
    x: z.number(),
    y: z.number()
})

export const createElementSchema = z.object({
    name: z.string(),
    imageUrl: z.string(),
    width : z.number(),
    height: z.number(),
    static : z.boolean()
})

export const updateElementSchema = z.object({
    imageUrl: z.string()
})

export const createAvatarSchema = z.object({
    name: z.string(),
    imageUrl: z.string(),
})

export const createMapSchema = z.object({
    name: z.string(),
    thumbnail : z.string(),
    dimensions : z.string().regex(/^[0-9]{1,4}x[0-9]{1,4}$/),
    defaultElements: z.array(z.object({
        elementId: z.string(),
        x: z.number(),
        y: z.number()
    }))
})


export const DeleteElementSchema = z.object({
    id: z.string(),
})

declare global {
    namespace Express {
        export interface Request {
            role? : "Admin" | "User";
            userId? : string;
        }
    }
}