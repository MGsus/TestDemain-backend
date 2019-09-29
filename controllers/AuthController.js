let User = require('../models/users');
let Session = require('../models/session');

let authController = {};

authController.singUp = function (req, res) {
    let {
        username,
        password
    } = req.body;

    if (!username) {
        return res.send({
            success: false,
            message: 'Error: username cannot be blank.'
        });
    }
    if (!password) {
        return res.send({
            success: false,
            message: 'Error: password cannot be blank.'
        });
    }

    username = username.toLowerCase();
    User.find({
        username: username
    })
        .then(previousUsers => {
            if (previousUsers.length > 0)
                return res.send({success: false, message: 'Error: Account already exists.'});
            // Save user
            const newUser = new User();
            newUser.username = username;
            newUser.password = newUser.generateHash(password);
            newUser.save()
                .then(function () {
                    res.json('User added!')
                })
                .catch(err => res.status(400).json('Error: ' + err))
        })
        .catch(err => res.status(400).json('Error: ' + err));
};

authController.logIn = function (req, res) {
    let {
        username,
        password
    } = req.body;

    if (!username)
        return res.send({success: false, message: 'Error: username cannot be blank'});

    if (!password)
        return res.send({success: false, message: 'Error: password cannot be blank.'});
    username = username.toLowerCase();

    User.find({username: username})
        .then(function (users) {
            if (users.length === 0) {
                return res.send({
                    success: false,
                    message: 'Error: usuario no encontrado.'
                });
            }

            if (users.length > 1) {
                return res.send({
                    success: false,
                    message: 'Error: usuario inválido'
                });
            }

            if (users[0].validPassword(password)) {
                Session.find({
                    userId: users[0]._id,
                    isDeleted: false
                }).then(function (sessions) {
                    if (sessions.length > 1) {
                        return res.send({
                            success: false,
                            message: 'Error: Sesión inválida'
                        });
                    } else if (sessions.length === 1) {
                        return res.send({
                            success: true,
                            message: 'Ingreso exitoso',
                            token: sessions[0]._id
                        });
                    } else {
                        const newSession = new Session();
                        newSession.userId = users[0]._id;
                        newSession.save().then(function (doc) {
                            return res.send({
                                success: true,
                                message: 'Valid login',
                                token: doc._id
                            });
                        }).catch(err => {
                            return res.send({
                                success: false,
                                message: 'Error: ' + err
                            });
                        })
                    }
                }).catch(err => {
                    return res.send({
                        success: false,
                        message: 'Error: ' + err
                    });
                });
            } else {
                return res.send({
                    success: false,
                    message: 'Error: la contraseña es incorrecta'
                });
            }
        }).catch(err => {
        return res.send({
            success: false,
            message: 'Error: ' + err
        });
    });
};

authController.logOut = function (req, res) {
    let {
        query,
        token
    } = req.body;

    Session.findOneAndUpdate({
        _id: token,
        isDeleted: false
    }, {
        $set: {
            isDeleted: true
        }
    }).then(function () {
        return res.send({
            success: true,
            message: 'Session closed'
        });
    }).catch(err => res.status(400).json('Error: ' + err));
};

authController.verify = function (req, res) {
    let {
        query,
        token
    } = req.body;

    Session.find({
        _id: token,
        isDeleted: false
    }).then(sessions => {
        if (sessions.length !== 1) {
            return res.send({
                success: false,
                message: 'Error: Invalid token.'
            });
        }

        return res.send({
            success: true,
            message: 'Token is good.'
        });
    }).catch(err => res.status(400).json('Error: ' + err));
};

module.exports = authController;