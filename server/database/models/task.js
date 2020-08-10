const mongoose = require('mongoose')


const schema = {
    title: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    createdAt: {
        type: Date,
        default: new Date().toISOString()
    },
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    todos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Todos' }]
}

const collectionName = 'Tasks'
const todoSchema = mongoose.Schema(schema)
const Task = mongoose.model(collectionName, todoSchema)

module.exports = {
    Task
}