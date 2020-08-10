const _ = require('lodash')
const _response = require('../helpers/response')
const { ObjectID } = require('mongodb')

const { Task } = require('../database')

/**
 *@name taskController
 *@returns {Object} Functions
 */

const taskController = (() => ({

    /**
     *@name create
     *@description creates a new task
     *@param {Object} request
     *@param {Object} response
     *@returns {Null} null
     */

    create(request, response) {
        const newTask = new Task({
            title: request.body.title,
            _creator: request.user._id
        })
        newTask.save()
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
                    return
                }

                console.log('error from taskController: ', err)
            })
    },

    /**
     *
     * @name get
     * @description fetches all tasks for a user
     * @param {*} request
     * @param {*} response
     */
    async fetchall(request, response) {
        const task = await Task.find({ _creator: request.user._id })
            .populate('todos')

        if (!task) {
            response.send({
                    ..._response,
                    status: 400,
                    errorMessage: err.errors.text.message
                })
                // console.log(err)
        } else {
            response.status(200).send({
                ..._response,
                message: 'list of tasks',
                data: task
            })
        }
        // .then(result => {

        // }).catch(err => {

        // })
    },

    /**
     *
     * @name fetch
     * @description fetches a single task for a user
     * @param {*} request
     * @param {*} response
     */

    async fetch(request, response) {
        const _id = request.params.id

        if (!ObjectID.isValid(_id)) {
            console.log('Not a Valid ID')
            return response.send({
                ..._response,
                status: 400,
                errorMessage: 'Not a Valid ID'
            })
        }

        try {
            const task = await Task.findOne({
                _id,
                _creator: request.user._id
            })
            if (!task) {
                response.send({
                    ..._response,
                    errMessage: 'Couldn\'t find ID',
                    status: 404
                })
                return console.log('Couldn\'t find ID')
            }
            response.status(200).send({
                ..._response,
                data: task,
                message: `Found Task: ${_id}`,
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
     * @description update single task to completed for a user
     * @param {*} request
     * @param {*} response
     */
    async patch(request, response) {
        const id = request.params.id
        const body = _.pick(request.body, ['title'])

        if (!ObjectID.isValid(id)) {
            console.log('Not a Valid ID')
            return response.send({
                ..._response,
                errMessage: 'Not a Valid ID',
                status: 400
            })
        }
        try {
            const task = await Task.findOneAndUpdate({
                    _id: id,
                    _creator: request.user._id
                },
                body, { new: true })
            if (!task) {
                response.send({
                    ..._response,
                    errMessage: 'Couldn\'t find ID',
                    status: 404
                })
                return console.log('Couldn\'t find ID')
            }
            response.send({
                ..._response,
                data: task,
                message: `Updated Task: ${id}`
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
     * @description deletes a single task for a user
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
            const task = await Task.findOneAndRemove({
                _id: id,
                _creator: request.user._id
            })
            if (!task) {
                response.send({
                    ..._response,
                    errMessage: 'Couldn\'t find ID',
                    status: 404
                })
                return console.log('Couldn\'t find ID')
            }
            response.status(200).send({
                ..._response,
                data: task,
                message: `Deleted: ${task.title}`,
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

module.exports = taskController