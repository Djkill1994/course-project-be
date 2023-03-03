const {Router} = require('express');
const User = require('../models/User');
const authMiddleware = require('../middlewares/auth');
const {validationResult} = require("express-validator");
const jwt = require("jsonwebtoken");
const router = Router();


router.put(
    '/', authMiddleware, async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    message: 'The data provided during user editing is incorrect.',
                    errors: errors.array(),
                });
            }

            const currentUser = await User.findOne({_id: jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET).userId});
            const {userName, email, avatarSrc} = req.body;
            await User.updateMany({_id: currentUser}, {$set: {userName: userName, email: email, avatarSrc: avatarSrc}});
            return res.status(200).json({message: 'Profile editing.'});
        } catch (error) {
            res.status(500).json({message: 'Profile editing error', error});
        }
    }
);

router.delete('/', authMiddleware, async (req, res) => {
    try {
        const {id} = req.body;
        await User.deleteOne({_id: id})
        res.status(200).json({message: 'User has been deleted.'});
    } catch (error) {
        res.status(500).json({message: 'Delete users error', error});
    }
});

module.exports = router;