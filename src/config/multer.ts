import multer, {FileFilterCallback} from "multer";

type DestinationCallback = (error: Error | null, destination: string) => void
type FileNameCallback = (error: Error | null, filename: string) => void
export const fileStorage = multer.diskStorage({
    destination: (
        request: Express.Request,
        file: Express.Multer.File,
        cb: DestinationCallback
    ): void => {
        cb(null, 'pub/images');
    },

    filename: (
        req: Express.Request,
        file: Express.Multer.File,
        cb: FileNameCallback
    ): void => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + file.originalname);
    }
})

export const fileFilter = function(req: Express.Request, file: Express.Multer.File, cb: FileFilterCallback) {
    let result = file.mimetype = 'image/png' || 'image/jpg' || 'image/jpeg';
    cb(null, !!result)
};