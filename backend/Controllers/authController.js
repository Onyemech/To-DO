const User = require('../models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const secretKey = process.env.SECRET_KEY;

async function registerUser(req, res) {
    const { firstName, lastName, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const user = new User({ firstName, lastName, email, password });
        const result = await user.save();

        console.log(result);
        return res.status(201).json({
            message: 'User registered successfully',
        });

    } catch(err) {
        console.error('Registration error:', err);
        return res.status(400).json({
            error: 'Registration failed',
            details: err.message
        });
    }
}


async function loginUser(req, res) {
    try{
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({error: 'Email and password are required'});
        }

        const user = await User.findOne({email})
        if (!user) {
            return res.status(401).send({error: 'User does not exist'});
        }
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).send({error: 'Wrong password'});
        }
        let token = jwt.sign({userId: user._id}, secretKey, {expiresIn: '1h'});
        let finalData = {
            userId: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            token,
            expiresIn: 3600
        }
        res.send(finalData);
    }catch (err){
        console.log('Login error',err);
        return res.status(400).json({
            error: 'Login failed',
            details: err.message
        })
    }
}

const AuthController = {
    registerUser,
    loginUser
};

module.exports = AuthController;