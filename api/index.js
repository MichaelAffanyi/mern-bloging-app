const express = require('express')
const app = express()
const cors = require('cors')
const { default: mongoose } = require('mongoose')
const User = require('./model/User')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

const salt = bcrypt.genSaltSync(10);
const secret = 'asdu8fy3ndan0cak03icm4j4mlmc7e'

app.use(cors({credentials: true, origin: 'http://localhost:3001'}))
app.use(express.json())
app.use(cookieParser())

mongoose.connect('mongodb+srv://blog:yKJ97Wb9K9t4eGay@cluster1.mgbwsht.mongodb.net/?retryWrites=true&w=majority')

app.post('/register', async (req, res) => {
    const {username, password} = req.body
    try{
        const UserDoc = await User.create({
            username,
            password: bcrypt.hashSync(password, salt)
        })
        res.json({data: UserDoc})
    }
    catch(error) {
        res.status(400).json(error)
    }
})

app.post('/login', async (req, res) => {
    const {username, password} = req.body
    const UserDoc = await User.findOne({username})
    const passOk = bcrypt.compareSync(password, UserDoc.password);
    if(passOk) {
        //login
        jwt.sign({username, id: UserDoc._id}, secret, {}, (err, token) => {
            if(err) throw err
            res.cookie('token', token).json({
                id: UserDoc._id,
                username
            })
        })
    }
    else {
        res.status(400).json('invalid credentials')
    }
})

app.get("/profile", (req, res) => {
    const {token} = req.cookies
    jwt.verify(token, secret, {}, (err, info) => {
        if(err) throw err
        res.json(info)
    })
})

app.post('/logout', (req, res) => {
    res.cookie('token', '').json('ok')
})

app.listen(4000)

//yKJ97Wb9K9t4eGay