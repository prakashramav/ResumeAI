const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const {z} = require('zod')
const auth = require('../middleware/auth')

const router = express.Router()

// Register Zod schema
const registerZodSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});


const loginZodSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
})

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { 
        expiresIn: process.env.JWT_EXPIRES_IN || "7d"
    });
}

// Register route
router.post('/register', async (req, res) => {
    try {
        const data = registerZodSchema.parse(req.body);
        const existing = await User.findOne({ email: data.email });
        if (existing) return res.status(400).json({ error: "User already Exists"});

        const user = await User.create(data);
        const token = generateToken({id: user._id, email: user.email});

        res.cookie("token", token, COOKIE_OPTIONS);
        res.status(201).json({ token, user, message: "Account created successfully" });
  } catch (err) {
        console.error("Register error FULL:", err);

        if (err.name === "ZodError") {
            return res.status(400).json({ error: err.errors[0].message });
        }

        if (err.code === 11000) {
            return res.status(400).json({ error: "Email already exists" });
        }

        res.status(500).json({ error: "Server error during registration" });
    }
})

// Login route

router.post('/login', async (req, res) => {
    try{ 
        const parsed = loginZodSchema.safeParse(req.body);

        if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0].message });
        }

        const { email, password } = parsed.data;

        const user = await User.findOne({ email });

        if(!user){
            return res.status(404).json({error: "User not found"});
        }

        const isMatch = await user.comparePassword(password);

        if(!isMatch){
            return res.status(401).json({error: "Invalid credentials"});
        }

        const token = generateToken({id: user._id, email: user.email});
        res.cookie("token", token, COOKIE_OPTIONS);
        res.status(200).json({user, token, message: "Logged in successfully"});
    }catch(err){
        if(err.name === 'ZodError') return res.status(400).json({error: err.errors[0].message});
        console.error("Login error:", err);
        res.status(500).json({error: "Server error During login"});
    }
})

// Logout route

router.post('/logout', (_req, res) => {
    res.clearCookie('token', { ...COOKIE_OPTIONS, maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
});

// ME route

router.get('/me', auth, async (req, res) => {
    res.json({user: req.user});
})

module.exports = router;