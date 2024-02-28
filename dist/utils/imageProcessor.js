import { unlink } from "fs";
import { path, __dirname } from './pathHelper.js';
const imageProcessor = {
    clearImage: (imagePath) => {
        imagePath = path.join(__dirname, 'pub', imagePath.toString());
        unlink(imagePath, (err) => {
            console.log(err);
        });
    }
};
export default imageProcessor;
