import jwt from "jsonwebtoken";
const parseTokenMetadata = async (req) => {
    const result = {
        isAuth: false
    };
    let bearer = req.headers.authorization;
    if (!bearer) {
        return result;
    }
    const token = bearer.split(' ')[1];
    try {
        let decoded = await jwt.verify(token, 'mysecretkey');
        result.isAuth = true;
        result.userId = decoded.userId;
        result.email = decoded.email;
    }
    catch (err) {
        console.log(err);
    }
    return result;
};
export const doAuth = async (req, res, next) => {
    const tokenMetadata = await parseTokenMetadata(req);
    req.isAuth = tokenMetadata.isAuth;
    req.userId = tokenMetadata.userId;
    req.userEmail = tokenMetadata.email;
    return next();
};
export const doAuthApollo = async (req) => {
    console.log(req);
    const authData = {
        isAuth: req.isAuth,
        userId: req.userId,
        email: req.userEmail
    };
    return authData;
};
