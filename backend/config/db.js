const mongoose = require('mongoose')
require('dotenv').config()

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI)
        console.log(`MongoDB Connected Succesfully:`)
    } catch(error) {
        console.log('MongoDB connection error:', error.message)
        process.exit(1)
    }
}

module.exports = connectDB