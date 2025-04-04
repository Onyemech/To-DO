const ToDo = require("../models/TodoList");

exports.createToDo = async (req, res) => {
    try {
        console.log('Request Body:', req.body);
        if (!req.body.title || !req.body.description) {
            return res.status(400).json({ message: "Title and description are required" });
        }

        const dto = {
            title: req.body.title,
            description: req.body.description,
            isCompleted: req.body.isCompleted || false,
            ...(req.user && { createdBy: req.user.userId })
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

exports.getAllToDo = async  (req,res)=>{
    let {userId} = req.params;

    try{
        const result = await ToDo.find({createdBy: userId});
        res.json(result);
    }catch (err) {
        console.log(err);
        res.status(500).json(err);
    }

}

exports.updateToDo = async (req,res)=>{
    try{
        const {id} = req.params;
        const data = req.body;
        const result = await ToDo.findByIdAndUpdate(id, {$set:data},{returnOriginal:false});
        console.log(result);
        res.send({message:'ToDo Task Updated'})
    }catch (err){
        console.log(err);
        res.status(500).send(err);
    }
}

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
