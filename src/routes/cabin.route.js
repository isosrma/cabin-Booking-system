import express from "express";
import { createCabin, getCabin, getCabinById, updateCabin, deleteCabin } from "../controller/cabin.controller.js";
import cabinUpload from "../middleware/multer.js";
import { accessTo, protectedRoutes } from "../middleware/protectedRoutes.js";


const router = express.Router();
router.post("/", protectedRoutes, accessTo("USER"), cabinUpload, createCabin);
router.get("/",getCabin); 
router.get("/:id", getCabinById);
router.patch("/:id", cabinUpload, updateCabin);
router.delete("/:id",deleteCabin);



export default router;

