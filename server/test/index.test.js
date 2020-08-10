const request = require('supertest')
const expect = require('expect')
const { ObjectID } = require('mongodb')

const { app } = require('../index')
const { populateTodos, testTodos, populateUsers, testUsers } = require('./seed')
const { Todo, User } = require('../database')

beforeEach(done => {
    populateUsers(done)
})
beforeEach(done => {
    populateTodos(done)
})
describe('POST /api/v1/todo', () => {
    it('should create a new Todo', done => {
        const text = 'Test create Todo'
        request(app)
            .post('/api/v1/todo')
            .set('Authorization', `Bearer ${testUsers[0].tokens[0].token}`)
            .set('x-auth', testUsers[0].tokens[0].token)
            .send({ text })
            .expect(200)
            .expect(res => {
                expect(res.body.data.text).toBe(text)
            })
            .end((err, res) => {
                let text = res.body.data.text
                if (err) return done(err)
                Todo.findOne({ text })
                    .then((result) => {
                        expect(result.text).toBe(text)
                        done()
                    }).catch((err) => {
                        done(err)
                    })
            })
    })

    it('should not create a new Todo', done => {
        request(app)
            .post('/api/v1/todo')
            .set('Authorization', `Bearer ${testUsers[0].tokens[0].token}`)
            .set('x-auth', testUsers[0].tokens[0].token)
            .send({})
            .expect(400)
            .end((err, res) => {
                if (err) return done(err)
                Todo.find()
                    .then((result) => {
                        expect(result.length).toBe(2)
                        done()
                    }).catch((err) => {
                        done(err)
                    })
            })
    })
})

describe('GET /api/v1/todo', () => {
    it('should get all todos', done => {
        request(app)
            .get('/api/v1/todo')
            .set('Authorization', `Bearer ${testUsers[0].tokens[0].token}`)
            .set('x-auth', testUsers[0].tokens[0].token)
            .expect(200)
            .expect(res => {
                expect(res.body.data.length).toBe(1)
            })
            .end(done)
    })
})

describe('GET /api/v1/todo:id', () => {
    it('should return todo doc', done => {
        request(app)
            .get(`/api/v1/todo/${testTodos[0]._id.toHexString()}`)
            .set('Authorization', `Bearer ${testUsers[0].tokens[0].token}`)
            .set('x-auth', testUsers[0].tokens[0].token)
            .expect(200)
            .expect(res => {
                expect(res.body.data.text).toBe(testTodos[0].text)
            })
            .end(done)
    })

    it('should not return todo doc from another user', done => {
        request(app)
            .get(`/api/v1/todo/${testTodos[1]._id.toHexString()}`)
            .set('Authorization', `Bearer ${testUsers[0].tokens[0].token}`)
            .set('x-auth', testUsers[0].tokens[0].token)
            .expect(404)
            .end(done)
    })
    it('should return 404 if todo not found', done => {
        request(app)
            .get(`/api/v1/todo/${new ObjectID().toHexString()}`)
            .set('x-auth', testUsers[0].tokens[0].token)
            .expect(404)
            .end(done)
    })
    it('should return 400 for non-objectId', done => {
        request(app)
            .get(`/api/v1/todo/${123}`)
            .set('x-auth', testUsers[0].tokens[0].token)
            .expect(400)
            .end(done)
    })
})

describe('DELETE /api/v1/todo:id', () => {
    it('Should remove a Todo', done => {
        const hexId = testTodos[1]._id.toHexString()
        request(app)
            .delete(`/api/v1/todo/${hexId}`)
            .set('Authorization', `Bearer ${testUsers[1].tokens[0].token}`)
            .set('x-auth', testUsers[1].tokens[0].token)
            .expect(200)
            .expect(res => {
                expect(res.body.data._id).toBe(hexId)
            })
            .end((err, res) => {
                if (err) return done(err)
                Todo.findById(hexId)
                    .then((result) => {
                        expect(result).toBeFalsy()
                        done()
                    }).catch((err) => {
                        done(err)
                    })
            })
    })

    it('Should not remove non-logged in user Todo ', done => {
        const hexId = testTodos[0]._id.toHexString()
        request(app)
            .delete(`/api/v1/todo/${hexId}`)
            .set('Authorization', `Bearer ${testUsers[1].tokens[0].token}`)
            .set('x-auth', testUsers[1].tokens[0].token)
            .expect(404)
            .end((err, res) => {
                if (err) return done(err)
                Todo.findById(hexId)
                    .then((result) => {
                        expect(result).toBeTruthy()
                        done()
                    }).catch((err) => {
                        done(err)
                    })
            })
    })
    it('Should return 404 if the todo is not found', done => {
        const hexId = new ObjectID().toHexString()
        request(app)
            .delete(`/api/v1/todo/${hexId}`)
            .set('Authorization', `Bearer ${testUsers[1].tokens[0].token}`)
            .set('x-auth', testUsers[1].tokens[0].token)
            .expect(404)
            .end(done)
    })
    it('Should return 400 if the todoID is not valid', done => {
        request(app)
            .delete(`/api/v1/todo/${123}`)
            .set('Authorization', `Bearer ${testUsers[1].tokens[0].token}`)
            .set('x-auth', testUsers[1].tokens[0].token)
            .expect(400)
            .end(done)
    })
})

describe('PATCH /api/v1/todo:id', () => {
    it('Should update Todo', done => {
        const hexId = testTodos[0]._id.toHexString()
        const text = 'test update a todo'
        const completed = true
        request(app)
            .patch(`/api/v1/todo/${hexId}`)
            .set('Authorization', `Bearer ${testUsers[0].tokens[0].token}`)
            .set('x-auth', testUsers[0].tokens[0].token)
            .send({...testTodos[0], text, completed })
            .expect(200)
            .expect(res => {
                const body = res.body.data
                expect(body.text).toBe(text)
                expect(body.completed).toBe(true)
                expect(body.completedAt).not.toBeNaN()
            })
            .end(done)
    })


    it('Should not update non-logged user Todo', done => {
        const hexId = testTodos[0]._id.toHexString()
        const text = 'test update a todo'
        const completed = true
        request(app)
            .patch(`/api/v1/todo/${hexId}`)
            .set('Authorization', `Bearer ${testUsers[1].tokens[0].token}`)
            .set('x-auth', testUsers[1].tokens[0].token)
            .send({...testTodos[0], text, completed })
            .expect(404)
            .end(done)
    })
    it('Should clear completedAt when todo not completed', done => {
        const hexId = testTodos[1]._id.toHexString()
        const text = 'test update a todo'
        const completed = false
        request(app)
            .patch(`/api/v1/todo/${hexId}`)
            .set('Authorization', `Bearer ${testUsers[1].tokens[0].token}`)
            .set('x-auth', testUsers[1].tokens[0].token)
            .send({...testTodos[1], text, completed })
            .expect(200)
            .expect(res => {
                const body = res.body.data
                expect(body.text).toBe(text)
                expect(body.completed).toBe(false)
                expect(body.completedAt).toBeFalsy()
            })
            .end(done)
    })
})

describe('Get /api/v1/user/info/:id', () => {
    it('it should return user if authenticated', done => {
        request(app)
            .get(`/api/v1/user/info/${testUsers[0]._id.toHexString()}`)
            .set('Authorization', `Bearer ${testUsers[0].tokens[0].token}`)
            .set('x-auth', testUsers[0].tokens[0].token)
            .expect(200)
            .expect(res => {
                expect(res.body.data._id).toBe(testUsers[0]._id.toHexString())
                expect(res.body.data.email).toBe(testUsers[0].email)
            })
            .end(done)
    })
    it('it should return 401 if user not authenticated', done => {
        request(app)
            .get(`/api/v1/user/info/${testUsers[0]._id.toHexString()}`)
            .expect(401)
            .expect(res => {
                expect(res.body.data).toBeUndefined()
            })
            .end(done)
    })
    it('it should return 400 if userId is not valid', done => {
        request(app)
            .get(`/api/v1/user/info/${testUsers[0]._id.toHexString()}1`)
            .set('Authorization', `Bearer ${testUsers[0].tokens[0].token}`)
            .set('x-auth', testUsers[0].tokens[0].token)
            .expect(400)
            .expect(res => {
                expect(res.body.data).toBeUndefined()
            })
            .end(done)
    })

    it('it should return 404 if userId is not sent', done => {
        request(app)
            .get(`/api/v1/user/info/`)
            .set('Authorization', `Bearer ${testUsers[0].tokens[0].token}`)
            .set('x-auth', testUsers[0].tokens[0].token)
            .expect(404)
            .expect(res => {
                expect(res.body).toEqual({})
            })
            .end(done)
    })
})

describe('POST /api/v1/user/register', () => {
    it('Should create user', done => {
        const email = 'tester@tester.com'
        const password = 'passwordtest'
        request(app)
            .post(`/api/v1/user/register`)
            .send({
                email,
                password
            })
            .expect(200)
            .expect(res => {
                expect(res.headers['x-auth']).toBeTruthy()
                expect(res.body.data._id).toBeTruthy()
                expect(res.body.data.email).toBe(email)
            })
            .end(err => {
                if (err) return done(err)
                User.findOne({ email })
                    .then(result => {
                        expect(result).toBeTruthy()
                        expect(result.password).toEqual(expect.not.stringMatching(password));
                        done()
                    }).catch(err => {
                        done(err)
                    })
            })
    })
    it('Should return validation error if email Invalid', done => {
        request(app)
            .post(`/api/v1/user/register`)
            .send({
                email: 'valentine',
                password: 'password1'
            })
            .expect(400)
            .expect(res => {
                expect(res.body.data).toBeFalsy()
            })
            .end(done)
    })
    it('Should return validation error if password length Invalid', done => {
        request(app)
            .post(`/api/v1/user/register`)
            .send({
                email: 'valentine@teating.com',
                password: 'pass'
            })
            .expect(400)
            .expect(res => {
                expect(res.body.data).toBeFalsy()
            })
            .end(done)
    })
    it('Should not create User if email in use', done => {
        request(app)
            .post(`/api/v1/user/register`)
            .send({
                email: testUsers[0].email,
                password: 'password1'
            })
            .expect(400)
            .expect(res => {
                expect(res.body.data).toBeFalsy()
            })
            .end(done)
    })
})

describe('POST /api/v1/user/login', () => {
    it('Should login a user and return auth token', done => {
        request(app)
            .post('/api/v1/user/login')
            .send({...testUsers[1] })
            .expect(200)
            .expect(res => {
                expect(res.headers['x-auth']).toBeTruthy()
                expect(res.body.data._id).toBeTruthy()
                expect(res.body.data.email).toBe(testUsers[1].email)
            })
            .end((err, res) => {
                if (err) {
                    return done(err)
                }
                User.findById(testUsers[1]._id)
                    .then(user => {
                        expect(user).toBeTruthy()
                        expect(user.tokens[1]).toMatchObject({
                            access: 'auth',
                            token: res.headers['x-auth']
                        })
                        done()
                    }).catch(err => {
                        done(err)
                    })
            })
    })
    it('Should reject invalid login', done => {
        request(app)
            .post('/api/v1/user/login')
            .send({ email: testUsers[1].email, password: 'password' })
            .expect(401)
            .expect(res => {
                expect(res.body.data).toBeFalsy()
            })
            .end((err, res) => {
                if (err) {
                    return done(err)
                }
                User.findById(testUsers[1]._id)
                    .then(user => {
                        expect(user).toBeTruthy()
                        expect(user.tokens.length).toBe(1)
                        done()
                    }).catch(err => {
                        done(err)
                    })
            })
    })
})

describe('DELETE /api/v1/user/logout', () => {
    it('Should remove auth token on logout', done => {
        request(app)
            .delete('/api/v1/user/logout')
            .set('Authorization', `Bearer ${testUsers[0].tokens[0].token}`)
            .set('x-auth', testUsers[0].tokens[0].token)
            .expect(200)
            .expect(res => {
                expect(res.body.data).toBeFalsy()
            })
            .end((err, res) => {
                if (err) {
                    return done(err)
                }
                User.findById(testUsers[0]._id)
                    .then(user => {
                        expect(user).toBeTruthy()
                        expect(user.tokens).not.toMatchObject({
                            access: 'auth',
                            token: res.headers['x-auth']
                        })
                        done()
                    }).catch(err => {
                        done(err)
                    })
            })
    })
})