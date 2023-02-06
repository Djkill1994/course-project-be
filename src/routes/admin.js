const {Router} = require('express');
const User = require('../models/User');
const authMiddleware = require('../middlewares/auth');
const router = Router();

router.get('/users', authMiddleware, async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users?.map((user) => ({
            id: user._id,
            username: user.username,
            banned: user.banned,
            email: user.email,
            avatarSrc: user.avatarSrc,
            role: user.role,
        })));
    } catch (error) {
        res.status(500).json({message: 'Get users error', error});
    }
})

router.delete('/users', authMiddleware, async (req, res) => {
    try {
        const {id} = req.body;
        await User.deleteOne({_id: id})
        res.status(200).json({message: 'User has been deleted.'});
    } catch (error) {
        res.status(500).json({message: 'Delete users error', error});
    }
})

router.post('/users/ban', authMiddleware, async (req, res) => {
    try {
        const {id} = req.body;
        await User.updateOne({_id: id}, {$set: {banned: true}})
        res.status(200).json({message: 'User was banned.'});
    } catch (error) {
        res.status(500).json({message: 'Ban users error', error});
    }
})

router.post('/users/unban', authMiddleware, async (req, res) => {
    try {
        const {id} = req.body;
        await User.updateOne({_id: id}, {$set: {banned: false}})
        res.status(200).json({message: 'User was unbanned.'});
    } catch (error) {
        res.status(500).json({message: 'Unban users error', error});
    }
})

router.post('/users/appoint-admin', authMiddleware, async (req, res) => {
    try {
        const {id} = req.body;
        await User.updateOne({_id: id}, {$set: {role: "admin"}})

        res.status(200).json({message: 'You have appointed an admin.'});
    } catch (error) {
        res.status(500).json({message: 'Appoint admin error', error});
    }
})

router.post('/users/remove-admin', authMiddleware, async (req, res) => {
    try {
        const {id} = req.body;
        await User.updateOne({_id: id}, {$set: {role: "user"}})

        res.status(200).json({message: 'You demoted admin to user.'});
    } catch (error) {
        res.status(500).json({message: 'Remove admin error', error});
    }
})

module.exports = router;