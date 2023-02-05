const {Router} = require('express');
const {check, validationResult} = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Collection = require("../models/Collection");
const router = Router();

router.post(
    '/create',
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
                imgSrc
            })
            await User.updateOne({_id: currentUser}, {$push: {collections: collection}})

            return res.status(200).json({message: 'Collection was created.'});
        } catch (error) {
            res.status(500).json({message: 'Create my collection error', error});
        }
    }
);

router.get(
    '/my',
    async (req, res) => {
        try {
            const currentUser = await User.findOne({_id: jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET).userId}).populate("collections");

            return res.json(currentUser.collections);
        } catch (error) {
            res.status(500).json({message: 'Get my collection error', error});
        }
    }
);

module.exports = router;
