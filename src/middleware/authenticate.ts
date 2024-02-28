import express from "express";
export const authenticate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!req.isAuth) {
        throw new Error('Action is not authorizes');
    }

    next();
}