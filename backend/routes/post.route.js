import express from "express";
import protectRoute from "../middleWare/protectRoute.js";
import { createPost, deletePost, createComment, likeunlikePost, getAllPosts, getLikedPosts, getFollowingPosts, getUserPosts } from "../controllers/post.controller.js";

const router = express.Router();

router.get("/all", protectRoute, getAllPosts);
router.post("/create", protectRoute, createPost)
router.delete("/:id", protectRoute, deletePost)
router.post("/comment/:id", protectRoute, createComment)
router.post("/like/:id", protectRoute, likeunlikePost);
router.get("/following", protectRoute, getFollowingPosts);
router.get("/likes/:id", protectRoute, getLikedPosts);
router.get("/user/:username", protectRoute, getUserPosts);

export default router;