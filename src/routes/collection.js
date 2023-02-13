const {Router} = require('express');
const {check, validationResult} = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Collection = require("../models/Collection");
const authMiddleware = require("../middlewares/auth");
const router = Router();

router.put(
    '/',
    [
        check('description').isLength({min: 1}),
        check('name').isLength({min: 1}),
        check('theme').isLength({min: 1}),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    message: 'The data provided during collection creation is incorrect.',
                    errors: errors.array(),
                });
            }

            const currentUser = await User.findOne({_id: jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET).userId});
            const {name, theme, description, imgSrc} = req.body;
            const collection = await Collection.create({
                name,
                theme,
                description,
                imgSrc,
                date: Date.now(),
            })
            await User.updateOne({_id: currentUser}, {$push: {collections: collection}})
            return res.status(200).json({message: 'Collection was created.'});
        } catch (error) {
            res.status(500).json({message: 'Create my collection error', error});
        }
    }
);

router.get(
    '/',
    async (req, res) => {
        try {
            const currentUser = await User.findOne({_id: jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET).userId}).populate("collections");

            return res.json(currentUser.collections);
        } catch (error) {
            res.status(500).json({message: 'Get my collections error', error});
        }
    }
);

router.get(
    `/:id`,
    async (req, res) => {
        try {
            const currentUser = await User.findOne({_id: jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET).userId}).populate("collections");
            const id = req.params.id
            const collection = await currentUser.collections
            return res.json(collection.findOne({_id: id}));
        } catch (error) {
            res.status(500).json({message: 'Get my collection error', error});
        }
    }
);

router.delete('/', authMiddleware, async (req, res) => {
    try {
        const {id} = req.body;
        await Collection.deleteOne({_id: id})
        res.status(200).json({message: 'Collection has been deleted.'});
    } catch (error) {
        res.status(500).json({message: 'Delete collection error', error});
    }
})

module.exports = router;
