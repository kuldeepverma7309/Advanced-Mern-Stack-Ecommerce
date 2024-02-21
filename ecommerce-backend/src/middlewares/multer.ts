import multer from "multer"
import {v4 as uuid} from "uuid"

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads");
    },
    filename: (req, file, cb) => {
        const id = uuid();
        const extensionName = file.originalname.split(".").pop();
        const fileName = `${id}.${extensionName}`;
        cb(null, fileName);
    }
});


export const singleUpload = multer({storage}).single("photo"); //we can access photo using req.file.