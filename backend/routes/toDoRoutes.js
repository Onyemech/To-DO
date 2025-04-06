const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authJwt');
const {createToDo, getAllToDo, updateToDo, deleteToDo} = require('../Controllers/toDoController');


router.post('/create-to-do', authenticateToken, createToDo);
router.get('/get-all-to-do/:userId', authenticateToken, getAllToDo);
router.delete('/delete-to-do/:id', authenticateToken, deleteToDo);
router.patch('/update-to-do/:id', authenticateToken, updateToDo);


module.exports = router;