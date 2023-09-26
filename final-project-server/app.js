const express = require('express');
const productRouter = require('./routes/product');
const loginRouter = require('./routes/login');
const cors = require('cors');
const {verify} = require("jsonwebtoken");

const secretKey = "secret-key";
const app = express();
const Product = require('./models/product')

Product.initializeData();
app.use(cors());
app.use(express.json());

app.use('/login', loginRouter);
app.use('/products', verifyToken, productRouter);

function verifyToken(req, res, next) {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: 'Token not provided' });
    }

    verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        req.userId = decoded.userId;
        next();
    });
}

app.use((req, res, next) => {
    res.status(404).json({ error: req.url + ' API not supported!' });
});

app.use((err, req, res, next) => {
    if (err.message === 'NOT Found') {
        res.status(404).json({ error: err.message });
    } else {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => console.log('listening to 3000...'));