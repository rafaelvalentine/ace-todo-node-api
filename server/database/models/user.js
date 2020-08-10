const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const _ = require('lodash')
const bcrypt = require('bcryptjs')

const schema = {
    username: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
        unique: true,
        validate: {
            validator: value => validator.isEmail(value),
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    tokens: [{
        access: {
            type: String,
            require: true
        },
        token: {
            type: String,
            require: true
        }
    }],
    createdAt: {
        type: Date,
        default: new Date().toISOString()
    }

}

const collectionName = 'Users'
const userSchema = new mongoose.Schema(schema)
userSchema.methods.toJSON = function() {
    const user = this
    const userObject = user.toObject()
    const authToken = _.findIndex(userObject.tokens, { 'access': 'auth' })
    const token = userObject.tokens[authToken].token
    return {..._.pick(userObject, ['_id', 'email', 'create', 'createdAt', 'username']), token }
}
userSchema.methods.generateAuthToken = function() {
    const user = this
    const access = 'auth'
    const token = jwt.sign({ _id: user._id.toHexString(), access }, process.env.JWT_SECRET)
    user.tokens = user.tokens.concat([{ access, token }])
        // user.tokens = [...user.tokens, { access, token }]
    return user.save()
        .then(() => token)
}

userSchema.methods.deleteToken = function(token) {
    const user = this
    const tokens = user.tokens
    user.tokens = _.filter(tokens, tokenObj => tokenObj.token !== token)
    return user.save()
}

userSchema.statics.findByToken = function(token) {
    const User = this
    let decoded
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
        return new Promise((resolve, reject) => {
            reject('Not Authenticated, bad userId or token')
        })
    }
    return User.findOne({
        _id: decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    })
}
userSchema.statics.findByCredentials = function({ email, password }) {
    const User = this
    return User.findOne({ email })
        .then(user => {
            if (!user) {
                return Promise.reject(new Error(' User doesn\'t not exist'))
            }
            return new Promise((resolve, reject) => {
                bcrypt.compare(password, user.password, (err, result) => {
                    if (result) {
                        resolve(user)
                    } else {
                        reject(err)
                    }
                })
            })
        })
}
userSchema.pre('save', function(next) {
    const user = this
    if (user.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            if (err) {
                console.log(err)
                return
            }
            bcrypt.hash(user.password, salt, (err, hash) => {
                if (err) {
                    console.log(err)
                    return
                }
                user.password = hash
                next()
            })
        })
    } else {
        next()
    }
})

const User = mongoose.model(collectionName, userSchema)

module.exports = {
    User
}