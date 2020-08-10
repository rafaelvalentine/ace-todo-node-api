const _ = require('lodash')
const _response = require('../helpers/response')
const { ObjectID } = require('mongodb')

const { Todo } = require('../database')

/**
 *@name todoController
 *@returns {Object} Functions
 */

const todoController = (() => ({

    /**
     *@name create
     *@description creates a new todo
     *@param {Object} request
     *@param {Object} response
     *@returns {Null} null
     */

    create(request, response) {
        const newTodo = new Todo({
            text: request.body.text,
            _creator: request.user._id,
            taskId: request.body.taskId
        })
        newTodo.save()
            .then(result => {
                response.status(200).send({
                    ..._response,
                    data: result
                })
            }).catch(err => {
                if (err.errors && err.errors.text) {
                    response.send({
                        ..._response,
                        status: 400,
                        errorMessage: err.errors.text.message
                    })
                } else {
                    response.send({
                        ..._response,
                        status: 400,
                        errorMessage: 'Couldn\'t create todo'
                    })
                }

                console.log('error from todoController: ', err)
            })
    },

    /**
     *
     * @name get
     * @description fetches all todos for a user
     * @param {*} request
     * @param {*} response
     */
    get(request, response) {
        console.log(request.user)
        Todo.find({ _creator: request.user._id })
            .then(result => {
                response.status(200).send({
                    ..._response,
                    data: result
                })
            }).catch(err => {
                response.send({
                    ..._response,
                    status: 400,
                    errorMessage: 'Couldn\'t get todos'
                })
                console.log(err)
            })
    },

    /**
     *
     * @name fetch
     * @description fetches a single todo for a user
     * @param {*} request
     * @param {*} response
     */

    async fetch(request, response) {
        const _id = request.params.id

        if (!ObjectID.isValid(_id)) {
            console.log('Not a Valid ID')
            return response.send({
                ..._response,
                errMessage: 'Not a Valid ID',
                status: 400
            })
        }

        try {
            const todo = await Todo.findOne({
                _id,
                _creator: request.user._id
            })
            if (!todo) {
                response.status(404).send({
                    ..._response,
                    errMessage: 'Couldn\'t find ID',
                    status: 404
                })
                return console.log('Couldn\'t find ID')
            }
            response.status(200).send({
                ..._response,
                data: todo,
                message: `Found Todo: ${_id}`,
                status: 200
            })
        } catch (e) {
            response.send({
                ..._response,
                errMessage: 'Something went wrong',
                status: 500
            })
            console.log(e)
        }
    },

    /**
     *
     * @name patch
     * @description update single todo to completed for a user
     * @param {*} request
     * @param {*} response
     */
    async patch(request, response) {
        const id = request.params.id
        const body = _.pick(request.body, ['text', 'completed'])

        if (!ObjectID.isValid(id)) {
            console.log('Not a Valid ID')
            return response.send({
                ..._response,
                errMessage: 'Not a Valid ID',
                status: 400
            })
        }
        if (body.completed && (_.isBoolean(body.completed) || body.completed.toLowerCase() === 'true')) {
            body.completedAt = new Date().getTime()
        } else {
            body.completed = false
            body.completedAt = null
        }
        try {
            const todo = await Todo.findOneAndUpdate({
                    _id: id,
                    _creator: request.user._id
                },
                body, { new: true })
            if (!todo) {
                response.status(404).send({
                    ..._response,
                    errMessage: 'Couldn\'t find ID',
                    status: 404
                })
                return console.log('Couldn\'t find ID')
            }
            response.status(200).send({
                ..._response,
                data: todo,
                message: `Updated Todo: ${id}`,
                status: 200
            })
        } catch (e) {
            response.send({
                ..._response,
                errMessage: 'Something went wrong',
                status: 500
            })
            console.log(e)
        }
    },
    /**
     *
     * @name delete
     * @description deletes a single todo for a user
     * @param {*} request
     * @param {*} response
     */

    async delete(request, response) {
        const id = request.params.id

        if (!ObjectID.isValid(id)) {
            console.log('Not a Valid ID')
            return response.send({
                ..._response,
                errMessage: 'Not a Valid ID',
                status: 400
            })
        }

        try {
            const todo = await Todo.findOneAndRemove({
                _id: id,
                _creator: request.user._id
            })
            if (!todo) {
                response.status(404).send({
                    ..._response,
                    errMessage: 'Couldn\'t find ID',
                    status: 404
                })
                return console.log('Couldn\'t find ID')
            }
            response.status(200).send({
                ..._response,
                data: todo,
                message: `Deleted Todo: ${id}`,
                status: 200
            })
        } catch (e) {
            response.send({
                ..._response,
                errMessage: 'Something went wrong',
                status: 500
            })
            console.log(e)
        }
    }

}))()

module.exports = todoController