const {Router} = require('express');
const userModel = require('../models/User');
const authMiddleware = require('../middlewares/auth');
const router = Router();

router.get('/users', authMiddleware, async (req, res) => {
    try {
        const users = await userModel.find();
        res.status(200).json(users?.map((user) => ({
            id: user._id,
            username: user.username,
            banned: user.banned,
            email: user.email,
            avatarSrc: user.avatarSrc,
            roles: user.roles,
            collections: user.collections,
        })));
    } catch (error) {
        res.status(500).json({message: 'Get users error', error});
    }
})

router.delete('/users', authMiddleware, async (req, res) => {
    try {
        const {ids} = req.body;
        await userModel.deleteMany({_id: ids})
        res.status(200).json({message: 'User has been deleted.'});
    } catch (error) {
        res.status(500).json({message: 'Delete users error', error});
    }
})

router.post('/users/ban', authMiddleware, async (req, res) => {
    try {
        const {ids} = req.body;
        await userModel.updateMany({_id: ids}, {$set: {status: true}})
        res.status(200).json({message: 'User was banned.'});
    } catch (error) {
        res.status(500).json({message: 'Ban users error', error});
    }
})

router.post('/users/unban', authMiddleware, async (req, res) => {
    try {
        const {ids} = req.body;
        await ids.map(async (id) => await userModel.findByIdAndUpdate(id, {status: false}));
        res.status(200).json({message: 'User was unbanned.'});
    } catch (error) {
        res.status(500).json({message: 'Unban users error', error});
    }
})

module.exports = router;
