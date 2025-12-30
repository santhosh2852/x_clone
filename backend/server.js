// const express = require('express');
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cloudinary from 'cloudinary';
import userRoute from './routes/user.route.js'; // Adjust the path as necessary

import authRoute from './routes/auth.route.js'; // Adjust the path as necessary
import connectDB from './db/connectDB.js';
import postRoute from './routes/post.route.js'; // Adjust the path as necessary
import notificationRoute from './routes/notification.route.js'; // Adjust the path as necessary
import cors from 'cors';
import path from 'path';

dotenv.config();
const app = express();
const __dirname = path.resolve();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET_KEY
});

app.use(cors({
    origin: 'http://localhost:5173', // Adjust the origin as necessary
    credentials: true
}))


const PORT = process.env.PORT;

app.use(express.json({
    limit: '5mb'
})); // Middleware to parse JSON bodies
app.use(cookieParser()); // Middleware to parse cookies
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute); // Ensure postRoute is imported correctly
app.use('/api/notifications', notificationRoute);

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "frontend/dist")));

    app.use((req, res) => {
        res.sendFile(
            path.resolve(__dirname, "frontend", "dist", "index.html")
        );
    });
}

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
    connectDB();
});