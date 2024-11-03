import express from "express";
import { User } from "./user.model.js";

const router = express.Router();
router.get("/", (req, res) => {
    const user: User = req.user;
    res.status(201).send({ username: user.username, isAdmin: user.isAdmin })
});

export default router;