const mongoose = require('mongoose');
const {Schema} = mongoose;

const toDoSchema = new Schema({
        title: {type:String,required:true},
        description: {type:String},
        isCompleted: {type:Boolean,required:true, default: false},
        completedOn: String,
        createdBy: {
            ref:"User",
            type:Schema.ObjectId,
        },
        reminder: { type: Date },
        notificationSent: { type: Boolean, default: false },    },
    {
        timestamps: true
    }
);
const ToDo = mongoose.model("ToDo", toDoSchema);

module.exports = ToDo;