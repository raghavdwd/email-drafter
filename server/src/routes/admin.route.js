import express from "express";
import { adminLogin, getAllUsers, approveUser, createTemplate, getAllTemplates, deleteTemplate, updateTemplate, deleteUser, createVariable, getAllVariables, updateVariable, deleteVariable, getDashboardStats } from "../controllers/admin.controller.js";
import { verifyToken, verifyAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// admin auth
router.post("/login", adminLogin);

// dashboard stats
router.get("/stats", verifyToken, verifyAdmin, getDashboardStats);

// user management (protected)
router.get("/users", verifyToken, verifyAdmin, getAllUsers);
router.put("/approve/:id", verifyToken, verifyAdmin, approveUser);
router.delete("/user/:id", verifyToken, verifyAdmin, deleteUser);

// template management (protected)
router.post("/template", verifyToken, verifyAdmin, createTemplate);
router.put("/template/:id", verifyToken, verifyAdmin, updateTemplate);
router.get("/templates", verifyToken, verifyAdmin, getAllTemplates);
router.delete("/template/:id", verifyToken, verifyAdmin, deleteTemplate);

// variable management (protected)
router.post("/variable", verifyToken, verifyAdmin, createVariable);
router.get("/variables", verifyToken, verifyAdmin, getAllVariables);
router.put("/variable/:id", verifyToken, verifyAdmin, updateVariable);
router.delete("/variable/:id", verifyToken, verifyAdmin, deleteVariable);

export default router;
