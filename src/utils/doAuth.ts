import express from "express";
import jwt from "jsonwebtoken";

interface AuthData {
    isAuth: boolean,
    userId?: string,
    email?: string
}

interface TokenMetadata {
    userId?: string,
    email?: string
}

const parseTokenMetadata = async (req: express.Request) => {
    const result: AuthData = {
        isAuth: false
    };

    let bearer = req.headers.authorization;
    if (!bearer) {
        return result;
    }

    const token = bearer.split(' ')[1];
    try {
        let decoded = await jwt.verify(token, 'mysecretkey') as TokenMetadata;
        result.isAuth = true;
        result.userId = decoded.userId;
        result.email = decoded.email;
    } catch(err) {
        console.log(err);
    }

    return result;
}

export const doAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const tokenMetadata = await parseTokenMetadata(req) as AuthData;

    req.isAuth = tokenMetadata.isAuth;
    req.userId = tokenMetadata.userId;
    req.userEmail = tokenMetadata.email;

    return next();
}

export const doAuthApollo = async (req: express.Request) => {
    const authData: AuthData = {
        isAuth: req.isAuth,
        userId: req.userId,
        email: req.userEmail
    };

    return authData;
}