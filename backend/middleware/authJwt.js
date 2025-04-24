const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided' });
    }

    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Invalid token format' });
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Invalid/Expired token' });

        if (!decoded.userId) {
            return res.status(403).json({ message: 'Invalid token format' });
        }

        req.user = decoded;
        next();
    });
};

module.exports = authenticateToken;