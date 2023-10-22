import express from "express";
import { codeGenerate } from "../controllers/GenerateCodeController.js";

const router = express.Router();

router.get("/admin/generate", codeGenerate);

export default router;
