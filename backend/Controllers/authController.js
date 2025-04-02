const User = require('../models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const secretKey = process.env.SECRET_KEY;

async function registerUser(req, res) {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({
            error: 'All fields are required',
            fields: { firstName, lastName, email, password }
        });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: 'Registration Failed.',
                message: 'User already exists',
                field: 'email'
            });
        }

        const user = new User({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.toLowerCase().trim(),
            password
        });
        const result = await user.save();

        return res.status(201).json({
            firstName: firstName.trim(),
            success: true,
            message: 'Registration successful',
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

        const user = await User.findOne({email});
        if (!user) {
            return res.status(401).send({message: 'User does not exist'});
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).send({message: 'You Entered the Wrong password'});
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
        });
    }
}

const AuthController = {
    registerUser,
    loginUser
};

module.exports = AuthController;