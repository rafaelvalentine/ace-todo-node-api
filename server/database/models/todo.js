const mongoose = require('mongoose');


const schema = {
    text: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Number,
        default: null
    },
    createdAt: {
        type: Date,
        default: new Date().toISOString()
    },
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }

}

const collectionName = 'Todos'
const todoSchema = mongoose.Schema(schema)
const Todo = mongoose.model(collectionName, todoSchema)

module.exports = {
    Todo
}