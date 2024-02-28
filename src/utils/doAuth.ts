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

const doAuth = async (req: express.Request) => {
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

export default doAuth;