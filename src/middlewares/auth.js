const jwt = require("jsonwebtoken");
const userModel = require("../models/User");

module.exports = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];

        if (!token) {
            res.status(401).json({message: 'You are not logged in, please log in.'});
        }

        const user = jwt.verify(token, process.env.JWT_SECRET);
        const currentUser = await userModel.findOne({_id: user.userId});

        if (currentUser.banned) {
            res.status(401).json({message: 'You just got banned.'});
        }

        if (!currentUser) {
            res.status(401).json({message: 'Your account does not exists.'});
        }

        next();
    } catch (error) {
        res.status(500).json({message: 'Auth error', error});
    }
}