const express = require('express')
const { authenticate } = require('../middleware')

const taskController = require('../controllers/taskController')
const todoController = require('../controllers/todoController')
const usersController = require('../controllers/usersController')

const BaseRoute = express.Router()

BaseRoute
    .get('/task', authenticate, taskController.fetchall)
    .post('/task', authenticate, taskController.create)
    .patch('/task/:id', authenticate, taskController.patch)
    .delete('/task/:id', authenticate, taskController.delete)
    .get('/todo', authenticate, todoController.get)
    .post('/todo', authenticate, todoController.create)
    .get('/todo/:id', authenticate, todoController.fetch)
    .patch('/todo/:id', authenticate, todoController.patch)
    .delete('/todo/:id', authenticate, todoController.delete)
    .post('/auth/user/register', usersController.create)
    .get('/auth/me/:id', authenticate, usersController.user)
    .post('/auth/user/login', usersController.login)
    .delete('/logout', authenticate, usersController.logout)

module.exports = BaseRoute