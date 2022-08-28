import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken';

import UserModel from 'src/Models/User';

const TOKEN_SECRET = 'asdasdrfxfdgsdfg';

import {
    validateLogin,
    validateRegistration,
} from './validators';

const AuthRouter = Router();

AuthRouter.post('/register', (request, response) => {
    const { error } = validateRegistration(request.body);

    if (error) {
        response.status(400).send(error.details[0].message);
    }

    UserModel.findOne({ where: { "email": req.body.email } })
        .then((maybeUser) => {
            if (maybeUser) {
                response.status(400).send("A User account with this email already exists");
            }

            bcrypt.genSalt(10)
                .then((salt) => {
                    bcrypt.hash(req.body.password, salt)
                        .then((hashedPassword) => {
                            const newUser = {
                                firstName: req.body.firstName,
                                lastName: req.body.lastName,
                                email: req.body.email,
                                password: hashedPassword
                            };

                            UserModel.create(newUser)
                                .then((savedUser) => {
                                    console.log('Saved user => ', savedUser);
                                    response.status(200).json({
                                        status: "Success",
                                        new_user_id: savedUser.id,
                                    });
                                }).catch((error) => {
                                    response.status(500).send(error.message)
                                })
                        });
                });
        });
});

AuthRouter.post('/login', (request, response) => {
    const { error } = validateLogin(request.body);

    if (error) {
        response.status(400).send(error.details[0].message);
    }

    UserModel.findOne({ where: { "email": req.body.email } })
        .then((user) => {
            if (!user) {
                response.status(400).send("Email is not correct");
            }
            bcrypt.compare(req.body.password, user.password)
                .then((validPassword) => {
                    if (!validPassword) {
                        response.status(400).send("Invalid password");
                    }

                    const token = jsonwebtoken.sign({
                        id: user.id,
                        exp: Math.floor(Date.now() / 1000) + (60 * 1000),
                    }, TOKEN_SECRET);

                    response.header("auth-token", token).send(token);
                });
        });
});

export default AuthRouter;
