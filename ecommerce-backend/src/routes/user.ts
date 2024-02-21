import  express  from "express";
import { deleteUser, getAllUsers, getUser, newUser } from "../controllers/user.js";
import { adminOnly } from "../middlewares/auth.js";

const router = express.Router();

//defining routes
router.post("/new",newUser);
router.get("/all",adminOnly,getAllUsers)
router.get("/:id",getUser)
router.delete("/:id",adminOnly,deleteUser)

export default router;