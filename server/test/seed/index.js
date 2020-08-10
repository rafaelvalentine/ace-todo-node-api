const { ObjectID } = require('mongodb')
const jwt = require('jsonwebtoken')

const { Todo, User } = require('../../database')
const userOneId = new ObjectID()
const userTwoId = new ObjectID()
const testTodos = [{
        _id: new ObjectID(),
        text: 'todod 1',
        _creator: userOneId
    },
    {
        _id: new ObjectID(),
        text: 'todo 2',
        _creator: userTwoId
    }
]

const testUsers = [{
    _id: userOneId,
    email: 'valentine@testone.com',
    password: 'password1',
    tokens: [{
        access: 'auth',
        token: jwt.sign({ _id: userOneId, access: 'auth' }, process.env.JWT_SECRET)
    }]
}, {
    _id: userTwoId,
    email: 'valentine@testtwo.com',
    password: 'password2',
    tokens: [{
        access: 'auth',
        token: jwt.sign({ _id: userTwoId, access: 'auth' }, process.env.JWT_SECRET)
    }]
}]
const populateTodos = done => {
    Todo.remove({})
        .then(() => {
            Todo.insertMany(testTodos)
                .then(() => done())
        })
}
const populateUsers = done => {
    User.remove({})
        .then(() => {
            const userOne = new User(testUsers[0]).save()
            const userTwo = new User(testUsers[1]).save()
            return Promise.all([userOne, userTwo])
        })
        .then(() => done())
}

module.exports = {
    testTodos,
    populateTodos,
    testUsers,
    populateUsers
}