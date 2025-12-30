import User from "../models/user.model.js";
import cloudinary from "cloudinary";
import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js";

export const createPost = async (req, res) => {
    try {
        const { text } = req.body;
        let { img } = req.body;
        const userId = req.user._id.toString();
        const user = await User.findOne({ _id: userId })
        if (!user) {
            return res.status(400).json({ error: "User not found" })
        }
        if (!img && !text) {
            return res.status(400).json({ error: "Post cannot be empty" })
        }
        if (img) {
            const uploadedRespone = await cloudinary.uploader.upload(img);
            img = uploadedRespone.secure_url;
        }
        const newPost = new Post({
            user: userId,
            text,
            img
        })
        await newPost.save();
        res.status(201).json({ newPost });
    } catch (error) {
        console.log(`Error in create post controller: ${error}`);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Post.findOne({ _id: id });
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        if (post.user.toString() !== req.user._id.toString()) {
            res.status(401).json({ error: "You are not authorized to delete this post" });
        }
        if (post.img) {
            const imgId = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }
        await Post.findByIdAndDelete({ _id: id });
        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        console.log(`Error in delete post controller: ${error}`);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const createComment = async (req, res) => {
    try {
        const { text } = req.body;
        const postId = req.params.id;
        const userId = req.user._id;
        if (!text) {
            return res.status(400).json({ error: "Comment cannot be empty" });
        }
        const post = await Post.findOne({ _id: postId });
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        const comment = {
            user: userId,
            text
        }
        post.comments.push(comment);
        await post.save();
        res.status(200).json(post);
    } catch (error) {
        console.log(`Error in create comment controller: ${error}`);
        res.status(500).json({ error: "Internal server error3" });
    }
}

export const likeunlikePost = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id: postId } = req.params;
        const post = await Post.findOne({ _id: postId });
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        const userLikedPost = post.likes.includes(userId);
        if (userLikedPost) {
            await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
            await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } })
            const updateLikes = post.likes.filter(like => like.toString() !== userId.toString());
            res.status(200).json(updateLikes);
        } else {
            post.likes.push(userId);
            await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } })
            await post.save();

            const notification = new Notification({
                from: userId,
                to: post.user,
                type: 'like'
            });
            await notification.save();
            const updatedLikes = post.likes;
            res.status(200).json(updatedLikes);
        }
    } catch (error) {
        console.log(`Error in like/unlike post controller: ${error}`);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }).populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: ["-password", "-email", "-follwing", "-followers", "-bio", "-link"]
        });
        if (posts.length === 0) {
            return res.status(200).json([])
        }
        res.status(200).json(posts);
    } catch (error) {
        console.log(`Error in get all posts controller: ${error}`);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const getLikedPosts = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById({ _id: userId });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const likedPosts = await Post.find({ _id: { $in: user.likedPosts } }).populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: ["-password", "-email", "-follwing", "-followers", "-bio", "-link"]
        });
        res.status(200).json(likedPosts);
    }
    catch (error) {
        console.log(`Error in get liked posts controller: ${error}`);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const getFollowingPosts = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById({ _id: userId });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const following = user.following;
        const feedPosts = await Post.find({ user: { $in: following } }).sort({ createdAt: -1 }).populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: ["-password", "-email", "-follwing", "-followers", "-bio", "-link"]
        });
        res.status(200).json(feedPosts);
    } catch (error) {
        console.log(`Error in get following posts controller: ${error}`);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const getUserPosts = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const userPosts = await Post.find({ user: user._id }).sort({ createdAt: -1 }).populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: ["-password", "-email", "-follwing", "-followers", "-bio", "-link"]
        });
        res.status(200).json(userPosts);
    } catch (error) {
        console.log(`Error in get user posts controller: ${error}`);
        res.status(500).json({ error: "Internal server error" });
    }
}