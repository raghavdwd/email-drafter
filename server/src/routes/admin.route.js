import express from "express";
import { adminLogin, getAllUsers, approveUser, createTemplate, getAllTemplates, deleteTemplate } from "../controllers/admin.controller.js";
import { verifyAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// admin auth
router.post("/login", adminLogin);

// user management (protected)
router.get("/users", verifyAdmin, getAllUsers);
router.put("/approve/:id", verifyAdmin, approveUser);

// template management (protected)
router.post("/template", verifyAdmin, createTemplate);
router.get("/templates", verifyAdmin, getAllTemplates);
router.delete("/template/:id", verifyAdmin, deleteTemplate);

export default router;
