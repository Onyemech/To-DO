const ToDo = require("../models/TodoList");
const mongoose = require('mongoose');

exports.createToDo = async (req, res) => {
    try {
        console.log('Request Body:', req.body);
        if (!req.body.title) {
            return res.status(400).json({ message: "Title is required" });
        }

        const dto = {
            title: req.body.title,
            description: req.body.description,
            isCompleted: req.body.isCompleted || false,
            ...(req.user && { createdBy: new mongoose.Types.ObjectId(req.user.userId) })
        };

        const todo = new ToDo(dto);
        const result = await todo.save();

        res.status(201).json({
            message: "Task created successfully",
            data: result
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Error creating task",
            error: err.message
        });
    }
}

exports.getAllToDo = async (req, res) => {
    const { userId } = req.params;

    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid userId format" });
        }

        const tasks = await ToDo.find({
            createdBy: new mongoose.Types.ObjectId(userId)
        });

        res.json({
            success: true,
            data: tasks
        });
    } catch (err) {
        console.error("Error in getAllToDo:", err.message, err.stack);
        res.status(500).json({ message: "Error fetching tasks", error: err.message });
    }
};

exports.updateToDo = async (req, res) => {
    try {
        const {id} = req.params;
        const {updateType, ...updateData} = req.body;
        const result = await ToDo.findByIdAndUpdate(
            id,
            {$set: updateData},
            {new: true}
        );

        const message = updateType === 'status'
            ? 'Status updated successfully'
            : 'Task updated successfully';

        res.json({
            success: true,
            message,
            data: result
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Update failed',
            error: err.message
        });
    }
};

exports.deleteToDo = async (req,res) =>{
    try{
      const {id} = req.params;
      const result = await ToDo.findByIdAndDelete(id);
      console.log(result);
      res.send({message:"ToDo Task Deleted!"})
    } catch (err) {
        console.log(err);
        res.status(400).send(err);
    }
}
