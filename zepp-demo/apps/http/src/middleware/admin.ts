import { NextFunction, Request, Response } from "express";
import { JWT_PASSWORD } from "../config";
import jwt from  "jsonwebtoken";

// Returns verifyin admin token
export const adminMiddleware = (req: Request,res: Response,next: NextFunction) => {
    const header = req.headers.authorization;
    const token = header?.split(" ")[1];

    if(!token) {
        res.status(403).json({message : "Unauthorized"})
        return
    }

    try {
        const decoded = jwt.verify(token, JWT_PASSWORD) as {role : string, userId: string}
        if(decoded.role == "admin" || "Admin"){
            req.userId = decoded.userId
            next()
        } else {
            res.status(403).json({message : "Unauthorized"})
            return
        }
    } catch(e) {
        res.status(401).json({message : "Unauthorized"})
        return
    }
}