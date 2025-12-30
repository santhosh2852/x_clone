import User from '../models/user.model.js';
import Notification from './../models/notification.model.js'
import bcrypt from 'bcryptjs';
import cloudinary from 'cloudinary';

export const getProfile = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username })
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }
        res.status(200).json({ user });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const followUnfollow = async (req, res) => {
    try {
        const { id } = req.params;
        const userToModify = await User.findById({ _id: id });
        const currentUser = await User.findById({ _id: req.user._id });
        if (id === req.user._id) {
            return res.status(400).json({ error: 'You cannot follow/unfollow yourself' });
        }
        if (!userToModify || !currentUser) {
            return res.status(400).json({ error: 'User not found' });
        }
        const isFollowing = currentUser.following.includes(id);
        if (isFollowing) {
            await User.findByIdAndUpdate({ _id: id }, { $pull: { followers: req.user._id } });
            await User.findByIdAndUpdate({ _id: req.user._id }, { $pull: { following: id } });
            res.status(200).json({ message: 'Unfollowed successfully' });
        } else {
            await User.findByIdAndUpdate({ _id: id }, { $push: { followers: req.user._id } });
            await User.findByIdAndUpdate({ _id: req.user._id }, { $push: { following: id } });

            const newNotification = new Notification({
                type: 'follow',
                from: req.user._id,
                to: userToModify._id
            })
            await newNotification.save();
            res.status(200).json({ message: 'Followed successfully' });
        }
    } catch (error) {
        console.error('Error in followUnfollow:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const getSuggestedUsers = async (req, res) => {
    try {
        const userId = req.user._id;
        const userFollowedByMe = await User.findById({ _id: userId }).select('-password');
        const users = await User.aggregate([
            {
                $match: {
                    _id: { $ne: userId }
                }
            }, {
                $sample: {
                    size: 10
                }
            }
        ])
        const filteredUsers = users.filter((user) => !userFollowedByMe.following.includes(user._id));
        const suggestUsers = filteredUsers.slice(0, 4);
        suggestUsers.forEach((user) => (user.password = null))
        res.status(200).json(suggestUsers);

    } catch (error) {
        console.error('Error in getSuggestedUsers:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const updateUser = async (req, res) => {
    try {
        const userId = req.user._id;
        const { fullName, username, email, currentPassword, newPassword, bio, link } = req.body;
        let { profileImg, coverImg } = req.body;
        let user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if ((!currentPassword && newPassword) || (currentPassword && !newPassword)) {
            return res.status(400).json({ error: 'Current password and new password must be provided together' });
        }

        if (currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ error: 'Current password is incorrect' });
            }
            if (newPassword.length < 6) {
                return res.status(400).json({ error: 'New password must be at least 6 characters long' });
            }
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        // Update fields only if they are provided and not empty
        if (fullName && fullName.trim()) {
            user.fullName = fullName;
        }
        if (username && username.trim()) {
            user.username = username;
        }
        if (email && email.trim()) {
            user.email = email;
        }
        // bio and link can be empty
        if (bio !== undefined) {
            user.bio = bio;
        }
        if (link !== undefined) {
            user.link = link;
        }
        if (profileImg) {
            user.profileImg = profileImg;
        }
        if (coverImg) {
            user.coverImg = coverImg;
        }

        if(profileImg){
            if(user.profileImg){
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
            }
            const uploadResponse = await cloudinary.uploader.upload(profileImg)
            profileImg=uploadResponse.secure_url;
        }

        if(coverImg){
            if(user.coverImg){
                await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
            }
            const uploadResponse = await cloudinary.uploader.upload(coverImg)
            coverImg=uploadResponse.secure_url;
        }

        user = await user.save();
        user.password = null; // Remove password from response
        res.status(200).json({ user });
    } catch (error) {
        console.error('Error in updateUser:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}