const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        let token = req.cookies?.token; // 

        if (!token) {
            const header = req.header("Authorization") || req.header('authorization');
            if (header?.startsWith("Bearer ")) {
                token = header.slice(7);
            }
        }

        if (!token) {
            return res.status(401).json({ error: "No token, authorization denied" });
        }

        const decode = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decode.id).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        req.user = user;

        next(); // 
    } catch (err) {
        console.error("Auth middleware error:", err.message);
        res.status(401).json({ error: "Token is not valid" });
    }
};

module.exports = auth;