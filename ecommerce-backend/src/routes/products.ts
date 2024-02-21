import express from 'express';
import { deleteProduct, getAdminProducts, getAllCategories, getLatestProducts, getSingleProduct, newProduct, searchAllProducts, updateProduct } from '../controllers/product.js';
import { adminOnly } from '../middlewares/auth.js';
import { singleUpload } from '../middlewares/multer.js';

const router = express.Router();

router.post("/new",adminOnly,singleUpload,newProduct)
router.get("/search", searchAllProducts);
router.get("/latest",getLatestProducts);
router.get("/categories",getAllCategories)
router.get("/admin/products",adminOnly,getAdminProducts)
router.get("/:id",getSingleProduct)
router.put("/:id", adminOnly, singleUpload, updateProduct);
router.delete("/:id",adminOnly,deleteProduct);



export default router;