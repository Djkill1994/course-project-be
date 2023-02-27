const {Router} = require('express');
const {check, validationResult} = require('express-validator');
const Collection = require("../models/Collection");
const Item = require("../models/Item");
const Tag = require("../models/Tag");
const Like = require("../models/Like");
const Comment = require("../models/Comment");
const authMiddleware = require("../middlewares/auth");
const User = require("../models/User");
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
            const {name, imgSrc, tags} = req.body;
            const id = req.params.id;
            const author = await User.findOne({collections: id}, ["userName", "avatarSrc"])

            await Promise.all(tags.map(async (tag) => {
                console.log(tag)
                if (!!await Tag.findOne({tag: tag})) {
                    return (await Tag.updateOne({tag: tag}, {$inc: {count: 1}}))
                } else {
                    return (await Tag.create({tag, count: 1}));
                }
            }));

            const dbTags = await Tag.find({tag: {$in: tags}});

            console.log(dbTags)

            const likes = await Like.create({
                count: 0,
                sender: []
            })
            const item = await Item.create({
                author,
                name,
                tags: dbTags,
                imgSrc,
                likes,
                date: new Date().toLocaleString("en-US", {timeZone: "Europe/Minsk"})
            })
            await Collection.updateOne({_id: id}, {$push: {items: item}});
            return res.status(200).json({message: 'Item was created.'});
        } catch (error) {
            console.log(error)
            res.status(500).json({message: 'Create my item error', error});
        }
    }
);
// todo придумать как получпть юзера публикации, перенести в коллекцию роут, реализовать получение тэгов
router.get(
    '/all/:id',
    async (req, res) => {
        try {
            const id = req.params.id;
            const items = await Collection.findOne({_id: id}, "items").populate("items");
            //todo зарефачить , не получаю на фронте Likes and tags
            return res.json(items.items.map((item) => ({
                id: item._id,
                name: item.name,
                imgSrc: item.imgSrc,
                date: item.date,
                tags: item.tags,
                likes: item.likes
            })));
        } catch (error) {
            res.status(500).json({message: 'Get my items error', error});
        }
    }
);

router.get(
    '/all',
    async (req, res) => {
        try {
            const items = await Item.find().populate("likes").populate("tags");
            return res.json(items.map((item) => ({
                id: item._id,
                author: item.author,
                name: item.name,
                imgSrc: item.imgSrc,
                date: item.date,
                tags: item.tags,
                likes: item.likes
            })));
        } catch (error) {
            res.status(500).json({message: 'Get my items error', error});
        }
    }
);

router.get(
    '/portion',
    async (req, res) => {
        try {
            const items = await Item.find().sort({date: -1}).limit(10).populate("likes").populate("tags");
            return res.json(items.map((item) => ({
                id: item._id,
                author: item.author,
                name: item.name,
                imgSrc: item.imgSrc,
                date: item.date,
                tags: item.tags,
                likes: item.likes
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
            const item = await Item.findOne({_id: id}).populate("tags").populate("comments").populate("likes");
            return res.json({
                id: item._id,
                author: item.author,
                name: item.name,
                imgSrc: item.imgSrc,
                date: item.date,
                tags: item.tags,
                comments: item.comments,
                likes: item.likes
            });
        } catch (error) {
            res.status(500).json({message: 'Get my item error', error});
        }
    }
);

router.get(
    '/tag/all',
    async (req, res) => {
        try {
            const tags = await Tag.find();
            return res.json(tags.map((tag) => ({
                id: tag._id,
                tag: tag.tag,
                count: tag.count
            })));
        } catch (error) {
            res.status(500).json({message: 'Get tags error', error});
        }
    }
);

router.get(
    '/tag/:id',
    async (req, res) => {
        try {
            const id = req.params.id;
            const cursor = await Item.find({
                tags: {$all: [id]}
            });
            const items = await Promise.all(cursor.map(({_id}) => {
                return Item.findOne({_id: _id}).populate("tags").populate("comments").populate("likes");
            }))

            console.log(items.map((e) => e.tags))
            return res.json(items.map((item) => ({
                id: item._id,
                author: item.author,
                name: item.name,
                imgSrc: item.imgSrc,
                date: item.date,
                tags: item.tags,
                likes: item.likes
            })));
        } catch (error) {
            res.status(500).json({message: 'Get found tag error', error});
        }
    }
);

router.put(
    '/comment/:id',
    async (req, res) => {
        try {
            const {sender, comment} = req.body;
            const id = req.params.id;
            const userSender = await User.findOne({userName: sender})
            const comments = await Comment.create({
                comment,
                sender: {
                    userName: userSender.userName,
                    avatarSrc: userSender.avatarSrc,
                },
                date: new Date().toLocaleString("en-US", {timeZone: "Europe/Minsk"})
            })

            await Item.updateOne({_id: id}, {$push: {comments: comments}});
            return res.status(200).json({message: 'Comment was created.'});
        } catch (error) {
            res.status(500).json({message: 'Create comment error', error});
        }
    }
);

router.put('/settings/:id', authMiddleware, async (req, res) => {
    try {
        const id = req.params.id;
        const {
            name, imgSrc, tags
        } = req.body;
        await Item.updateMany({_id: id}, {
            $set: {
                name: name,
                imgSrc: imgSrc,
                tags: tags
            }
        })

        res.status(200).json({message: 'You have update an item settings.'});
    } catch (error) {
        res.status(500).json({message: 'Update item settings error', error});
    }
});

router.put('/like/:id', authMiddleware, async (req, res) => {
    try {
        const id = req.params.id;
        const {sender} = req.body;
//todo зарефачить код
        const like = await Item.findOne({_id: id}, "likes").populate("likes");
        await Like.updateOne({_id: like.likes._id}, {$inc: {count: 1}});
        await Like.updateOne({_id: like.likes._id}, {$push: {sender: sender}});

        res.status(200).json({message: 'You have like.'});
    } catch
        (error) {
        res.status(500).json({message: 'Like error', error});
    }
});

router.put('/unLike/:id', authMiddleware, async (req, res) => {
    try {
        const id = req.params.id;
        const {sender} = req.body;
//todo зарефачить код
        const like = await Item.findOne({_id: id}, "likes").populate("likes");
        await Like.updateOne({_id: like.likes._id}, {$inc: {count: -1}});
        await Like.updateOne({_id: like.likes._id}, {$unset: {sender: sender}});

        res.status(200).json({message: 'You have like.'});
    } catch
        (error) {
        res.status(500).json({message: 'Like error', error});
    }
});

router.delete('/', authMiddleware, async (req, res) => {
    try {
        const {id} = req.body;
        await Item.deleteMany({_id: id});
        res.status(200).json({message: 'Item has been deleted.'});
    } catch (error) {
        res.status(500).json({message: 'Delete item error', error});
    }
});

module.exports = router;
