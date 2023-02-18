require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json({extended: true}));
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/admin', require('./src/routes/admin'));
app.use('/api/collections', require('./src/routes/collection'));
app.use('/api/user', require('./src/routes/user'));
app.use('/api/items', require('./src/routes/item'));

const PORT = process.env.PORT;

const start = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useUnifiedTopology: true,
        });
        app.listen(PORT, () =>
            console.log(`Started on port: ${PORT}...`)
        );
    } catch (e) {
        console.log('Server error', e.message);
        process.exit(1);
    }
};

start();