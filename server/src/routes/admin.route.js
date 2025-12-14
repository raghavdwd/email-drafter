import express from "express";
import { adminLogin, getAllUsers, approveUser, createTemplate, getAllTemplates, deleteTemplate } from "../controllers/admin.controller.js";
import { verifyToken, verifyAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// admin auth
router.post("/login", adminLogin);

// user management (protected)
router.get("/users", verifyToken, verifyAdmin, getAllUsers);
router.put("/approve/:id", verifyToken, verifyAdmin, approveUser);

// template management (protected)
router.post("/template", verifyToken, verifyAdmin, createTemplate);
router.get("/templates", verifyToken, verifyAdmin, getAllTemplates);
router.delete("/template/:id", verifyToken, verifyAdmin, deleteTemplate);

export default router;
