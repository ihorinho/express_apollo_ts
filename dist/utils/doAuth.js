import jwt from "jsonwebtoken";
const doAuth = async (req) => {
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
export default doAuth;
