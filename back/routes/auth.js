const express = require('express');
const userController = require('../controllers/user');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.delete('/delete/:userId', authenticateToken, userController.deleteUser);

module.exports = router;
