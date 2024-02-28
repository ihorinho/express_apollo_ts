export const authenticate = (req, res, next) => {
    if (!req.isAuth) {
        throw new Error('Action is not authorizes');
    }
    next();
};
