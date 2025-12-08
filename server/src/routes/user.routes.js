import express from "express";

const router = express.Router();

router.post("/login", (req, res) => {
    const {password} = req.body;
    //if pass is empty
    if(!password) {
        return res.json({
            success: false,
            message: "Password is required"
        });
    }
    //if pass is not raghav
    if(password !== "raghav") {
        return res.json({
            success: false,
            message: "Invalid password"
        })
    }
    res.json({
        success: true,
        message: "Login successful"
    });
});
