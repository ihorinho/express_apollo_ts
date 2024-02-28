const createImageResp = (req, res, next) => {
    if (!req.file) {
        return res.json({ message: 'No file provided' });
    }
    return res.status(201)
        .json({ success: true, image: 'images/' + req.file.filename });
};
export default createImageResp;
