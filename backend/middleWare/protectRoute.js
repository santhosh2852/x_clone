import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if(!token){
            return res.status(400).json({error: 'Unauthorized access'});
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded Token:', decoded);

        if(!decoded){
            return res.status(400).json({error: 'Invalid token'});
        }
        // const user = await User.findOne({ _id: decoded.id }).select('-password');
        const user = await User.findOne({ _id: decoded.userId }).select('-password');
        if(!user){
            return res.status(404).json({error: 'User not found'});
        }
        req.user = user;
        next();
    }catch(error) {
        console.error('Error during protectRoute:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
}
export default protectRoute;