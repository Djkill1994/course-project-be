const {Router} = require('express');
const {check, validationResult} = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Collection = require("../models/Collection");
const Item = require("../models/Item");
const authMiddleware = require("../middlewares/auth");
const router = Router();

router.put(
    '/:id', [check('name').isLength({min: 1})],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    message: 'The data provided during item creation is incorrect.',
                    errors: errors.array(),
                });
            }
            const {name, imgSrc} = req.body;
            const id = req.params.id;
            const item = await Item.create({
                name,
                imgSrc,
                // todo решить нужна ли дата
                date: new Date().toLocaleString("en-US", {timeZone: "Europe/Minsk"})
            })
            await Collection.updateOne({_id: id}, {$push: {items: item}});
            return res.status(200).json({message: 'Item was created.'});
        } catch (error) {
            res.status(500).json({message: 'Create my item error', error});
        }
    }
);
// todo придумать как получпть юзера публикации
router.get(
    '/all/:id',
    async (req, res) => {
        try {
            const id = req.params.id;
            const items =  await Collection.findOne({_id: id}, ["items"]).populate("items");
            return res.json(items.items.map((item) => ({
                id: item._id,
                name: item.name,
                imgSrc: item.imgSrc,
            })));
        } catch (error) {
            res.status(500).json({message: 'Get my items error', error});
        }
    }
);

router.get(
    '/:id',
    async (req, res) => {
        try {
            const id = req.params.id;
            const item =  await Item.findOne({_id: id});
            return res.json({
                id: item._id,
                name: item.name,
                imgSrc: item.imgSrc,
            });
        } catch (error) {
            res.status(500).json({message: 'Get my item error', error});
        }
    }
);

router.delete('/', authMiddleware, async (req, res) => {
    try {
        const {id} = req.body;
        await Item.deleteOne({_id: id});
        res.status(200).json({message: 'Item has been deleted.'});
    } catch (error) {
        res.status(500).json({message: 'Delete item error', error});
    }
})

module.exports = router;
