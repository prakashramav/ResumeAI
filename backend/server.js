const express = require('express')
const cors = require('cors')
require('dotenv').config()
const cookieParser = require('cookie-parser')
const rateLimit = require('express-rate-limit')
const connectDB = require('./config/db')
const authRoutes = require('./routes/auth')

connectDB();

const app = express()

const PORT = process.env.PORT || 5000

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again after 15 minutes"
})

const aiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // limit each IP to 20 requests per windowMs
    message: "Too many AI requests from this IP, please try again after an hour"
})

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
}))

app.use(cookieParser())
app.use(express.json({ limit: '10mb' })) // increase payload limit for resume data
app.use(limiter)

//routes 

app.use('/api/auth', authRoutes);



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})