const jwt = require('jsonwebtoken');
const users = [
    { id: 1, username: 'user1', password: 'user1' },
    { id: 2, username: 'user2', password: 'user2' },
];
const secretKey = "secret-key";

exports.login = (req, res, next) => {
    const { username, password } = req.body;

    // Find the user by username
    const user = users.find(u => u.username === username);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Verify the password
    if (password !== user.password) {
        return res.status(401).json({ message: 'Invalid password' });
    }

    // Create a JWT token
    const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '24h' });

    res.json({ token, username });
}