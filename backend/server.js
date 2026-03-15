const express = require('express')
const app = express()
const connectDB = require('./config/db')

connectDB()

app.use(express.json())

app.get('/', (req, res) => {
    res.send('API is running')
})

app.get('/loveu', (req,res) => {
    res.send('I love you')
})

app.listen(5000, () => {
    console.log('Server is running on http://localhost:5000')
})