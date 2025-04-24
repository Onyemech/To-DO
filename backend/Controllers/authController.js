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

        let token = jwt.sign({userId: user._id.toString()}, secretKey, {expiresIn: '1h'});
        let finalData = {
            userId: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            token,
            expiresIn: 3600
        }
        res.status(200).json({
            success: true,
            data: finalData
        });
    }catch (err){
        console.log('Login error',err);
        return res.status(400).json({
            error: 'Login failed',
            details: err.message
        });
    }
}

async function updatePlayerId(req, res) {
    try {
        console.log('Received request to update playerId for user:', req.user.userId);
        const userId = mongoose.Types.ObjectId(req.user.userId);
        const user = await User.findById(userId);
        if (user) {
            user.playerId = req.body.playerId;
            await user.save();
            console.log('Player ID updated successfully for user:', req.user.userId);
            res.json({ message: 'Player ID updated successfully' });
        } else {
            console.log('User not found for ID:', req.user.userId);
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error updating playerId:', error);
        res.status(500).json({ message: 'Error updating player ID', error });
    }
}

const AuthController = {
    registerUser,
    loginUser,
    updatePlayerId
};

module.exports = AuthController;