import express from "express";
import {
    codeGenerate,
    userAddNewDiscount,
} from "../controllers/GenerateCodeController.js";

const router = express.Router();

router.post("/admin/generate", codeGenerate);
router.post("/addnewdiscount", userAddNewDiscount);

export default router;
