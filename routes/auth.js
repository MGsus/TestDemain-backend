const router = require('express').Router();
let User = require('../models/users');
let Session = require('../models/session');

router.route('/users').get((req, res) => {

    User.find()
        .then(users => {
            res.json(users)
        })
        .catch(err => res.status(400).json('Error: ' + err))
});

router.route('/sessions').get((req, res) => {

    Session.find()
        .then(sessions => {
            res.json(sessions)
        })
        .catch(err => res.status(400).json('Error: ' + err))
});

router.route('/add').post((req, res) => {
    let username = req.body.username
    let password = req.body.password

    if (!username) {
        return res.send({
            success: false,
            message: 'Error: username cannot be blank.'
        })
    }

    if (!password) {
        return res.send({
            success: false,
            message: 'Error: password cannot be blank.'
        })
    }

    username = username.toLowerCase()

    User.find({
        username: username
    })
        .then(previusUsers => {
            if (previusUsers.length > 0) {
                return res.send({
                    success: false,
                    message: 'Error: Account already exists.'
                })
            }

            const newUser = new User()
            newUser.username = username
            newUser.password = newUser.generateHash(password)

            newUser.save()
                .then(users => {
                    return res.send({
                        success: true,
                        message: 'User added!'
                    })
                })
                .catch(err => {
                    return res.send({
                        success: false,
                        message: 'Error: ' + err
                    })
                })
        })
        .catch(err => {
            return res.send({
                success: false,
                message: 'Error: ' + err
            })
        })
});

router.route('/login').post((req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    if (!username) {
        return res.send({
            success: false,
            message: 'Error: username cannot be blank.'
        })
    }

    if (!password) {
        return res.send({
            success: false,
            message: 'Error: password cannot be blank.'
        })
    }

    username = username.toLowerCase();

    User.find({
        username: username
    })
        .then(users => {

            if (users.length === 0) {
                return res.send({
                    success: false,
                    message: 'Error: usuario no encontrado'
                })
            }

            if (users.length > 1) {
                return res.send({
                    success: false,
                    message: 'Error: usuario inválido'
                })
            }

            if (users[0].validPassword(password)) {
                Session.find({
                    userId: users[0]._id,
                    isDeleted: false
                })
                    .then((sessions) => {
                        if (sessions.length > 1) {
                            return res.send({
                                success: false,
                                message: 'Error: Invalid Session.'
                            })
                        } else if (sessions.length === 1) {
                            return res.send({
                                success: true,
                                message: 'Valid Login.',
                                token: sessions[0]._id
                            })
                        } else {
                            const newSession = new Session();
                            newSession.userId = users[0]._id
                            newSession.save()
                                .then((doc) => {
                                    return res.send({
                                        success: true,
                                        message: 'Valid Login.',
                                        token: doc._id
                                    })
                                })
                                .catch(err => {
                                    return res.send({
                                        success: false,
                                        message: 'Error: ' + err
                                    })
                                })
                        }
                    })
                    .catch(err => {
                        return res.send({
                            success: false,
                            message: 'Error: ' + err
                        })
                    })
            } else {
                return res.send({
                    success: false,
                    message: 'Error: La contraseña es incorrecta'
                })
            }
        })
        .catch(err => {
            return res.send({
                success: false,
                message: 'Error: ' + err
            })
        })
});

router.route('/verify').get((req, res) => {
    const { query } = req
    const { token } = query

    Session.find({
        _id: token,
        isDeleted: false
    })
        .then((sessions) => {
            if (sessions.length !== 1) {
                return res.send({
                    success: false,
                    message: 'Error: Invalid Token.'
                })
            }

            return res.send({
                success: true,
                message: 'Token is good.'
            })
        })
        .catch(err => res.status(400).json('Error: ' + err))
});

router.route('/logout').get((req, res) => {
    const { query } = req
    const { token } = query

    Session.findOneAndUpdate({
        _id: token,
        isDeleted: false
    }, {
            $set: {
                isDeleted: true
            },
        })
        .then(() => {
            return res.send({
                success: true,
                message: 'Session closed.'
            })
        })
        .catch(err => res.status(400).json('Error: ' + err))
});

module.exports = router;