const _ = require('lodash')
const _response = require('../helpers/response')
const validator = require('validator')
const { ObjectID } = require('mongodb')

const { User } = require('../database')

/**
 *@name todoController
 *@returns {Object} Functions
 */

const usersController = (() => ({

    /**
     *@name create
     *@description creates a new user
     *@param {Object} request
     *@param {Object} response
     *@returns {Null} null
     */

    create(request, response) {
        const userInfo = _.pick(request.body, ['username', 'email', 'password'])
        const newUser = new User(userInfo)
        newUser.save()
            .then(() => newUser.generateAuthToken())
            .then(token => {
                response.header('x-auth', token).status(200).send({
                    ..._response,
                    data: {
                        token,
                        user: newUser
                    },
                    message: `Created User: ${newUser.email}`,
                    status: 200
                })
            }).catch(err => {
                if (err.errors && err.errors.email) {
                    response.send({
                        ..._response,
                        errMessage: err.errors.email.properties.message || 'Invalid Credentials',
                        status: 400
                    })
                } else if (err.errors && err.errors.username) {
                    response.send({
                        ..._response,
                        errMessage: err.errors.username.properties.message || 'Invalid Credentials',
                        status: 400
                    })
                } else if (err.errors && err.errors.password) {
                    response.send({
                        ..._response,
                        errMessage: err.errors.password.properties.message || 'Invalid Credentials',
                        status: 400
                    })
                } else if (err && err.errmsg) {
                    response.send({
                        ..._response,
                        errMessage: 'Username/Email already exists' || 'Invalid Credentials',
                        status: 400
                    })
                } else {
                    response.send({
                        ..._response,
                        errMessage: 'Something went wrong',
                        status: 500
                    })
                }
            })
    },

    /**
     *@name user
     *@description gets a user
     *@param {Object} request
     *@param {Object} response
     *@returns {Null} null
     */

    user(request, response) {
        const id = request.params.id
        if (!ObjectID.isValid(id)) {
            response.send({
                ..._response,
                errMessage: 'Authentication failed',
                status: 400
            })
            return
        }
        if (validator.equals(request.user._id.toString(), id)) {
            response.status(200).send({
                ..._response,
                data: { token: request.token, user: _.pick(request.user, ['_id', 'email', 'createdAt', 'username']) },
                message: `Found User: ${request.user.email}`,
                status: 200
            })
            return
        }
        response.status(401).send({
            ..._response,
            status: 401,
            errMessage: 'Not Authenticated, bad userId or token'
        })
    },

    /**
     *@name login
     *@description login a user
     *@param {Object} request
     *@param {Object} response
     *@returns {Null} null
     */

    login(request, response) {
        const userInfo = _.pick(request.body, ['email', 'password'])

        User.findByCredentials(userInfo)
            .then(user => user.generateAuthToken()
                .then(token => {
                    response.header('x-auth', token).status(200).send({
                        ..._response,
                        data: {
                            token,
                            user: _.pick(user, ['_id', 'email', 'createdAt', 'username'])
                        },
                        message: `Found User: ${user.email}`,
                        status: 200
                    })
                })
            )
            .catch(err => {
                response.send({
                    ..._response,
                    status: 401,
                    errMessage: 'Invalid email / password !'
                })
            })
    },
    /**
     *@name logout
     *@description logout a user
     *@param {Object} request
     *@param {Object} response
     *@returns {Null} null
     */

    logout(request, response) {
        const user = request.user
        const token = request.token

        user.deleteToken(token)
            .then(user => {
                response.status(200).send({
                    ..._response,
                    message: `Logged out User: ${user.email}`,
                    status: 200
                })
            }, () => {
                response.send({
                    ..._response,
                    status: 400,
                    errMessage: 'Something went wrong'
                })
            })
    }

}))()

module.exports = usersController