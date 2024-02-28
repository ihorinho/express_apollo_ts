import multer from "multer";
export const fileStorage = multer.diskStorage({
    destination: (request, file, cb) => {
        cb(null, 'pub/images');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + file.originalname);
    }
});
export const fileFilter = function (req, file, cb) {
    let result = file.mimetype = 'image/png' || 'image/jpg' || 'image/jpeg';
    cb(null, !!result);
};
