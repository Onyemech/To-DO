const User = require('../models/User');

async function registerUser(req, res){
    let{firstName, lastName, email, password}=req.body;
    try{
        const duplicate = await User.find({email});
        duplicate && duplicate.length > 0
            ? res.status(400).json({ error : 'User already exists'})
            : res.status(400).json('success');
    }catch(err){
        console.log(err);
        res.status(400).send(err);
    }
    res.send("success");
}

const AuthController = {
    registerUser
}

module.exports = AuthController;