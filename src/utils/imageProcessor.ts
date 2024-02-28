import {unlink, PathLike} from "fs";
import {path, __dirname} from './pathHelper.js';

const imageProcessor = {
    clearImage: (imagePath: PathLike) => {
        imagePath = path.join(__dirname, 'pub', imagePath.toString());
        unlink(imagePath, (err: NodeJS.ErrnoException | null) => {
            console.log(err);
        });
    }
}

export default imageProcessor;