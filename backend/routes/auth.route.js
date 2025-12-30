import express from 'express';
const router = express.Router();
import { signup, login, logout, getMe } from '../controllers/auth.controller.js';
import protectRoute from './../middleWare/protectRoute.js'; // Adjust the path as necessary

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protectRoute, getMe);

export default router;