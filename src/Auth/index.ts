import { Router } from 'express';
import { get } from 'lodash';
import bcrypt from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken';

import { sequelize } from 'src/Database'; 

import authMiddleware from './middleware';

const TOKEN_SECRET = 'asdasdrfxfdgsdfg';

import {
    validateLogin,
    validateRegistration,
} from './validators';

const AuthRouter = Router();

AuthRouter.post('/register', (request, response) => {
    const { error } = validateRegistration(request.body);

    if (error) {
        return response.status(400).send(error.details[0].message);
    }
    sequelize.models.User.findOne({ where: { "email": request.body.email } })
        .then((maybeUser) => {
            if (maybeUser) {
                return response.status(400).send("server.error.acount.alreadyExist");
            }

            bcrypt.genSalt(10)
                .then((salt) => {
                    bcrypt.hash(request.body.password, salt)
                        .then((hashedPassword: string) => {
                            const newUser = {
                                firstName: request.body.firstName,
                                lastName: request.body.lastName,
                                email: request.body.email,
                                password: hashedPassword
                            }
                            sequelize.models.User.create(newUser)
                                .then((savedUser) => {
                                    return response.status(200).json({
                                        status: "Success",
                                        id: get(savedUser, 'id'),
                                    });
                                }).catch((error) => {
                                    return response.status(500).send(error.message)
                                })
                        });
                });
        });
});

AuthRouter.post('/login', (request, response) => {
    const { error } = validateLogin(request.body);

    if (error) {
        return response.status(400).send(error.details[0].message);
    }

    sequelize.models.User.findOne({ where: { "email": request.body.email } })
        .then((user) => {
            if (!user) {
                return response.status(400).send("server.error.notFound.email");
            }
            bcrypt.compare(request.body.password, get(user, 'password'))
                .then((validPassword) => {
                    if (!validPassword) {
                        return response.status(400).send("server.error.invalid.password");
                    }

                    const token = jsonwebtoken.sign({
                        id: get(user, 'id'),
                    }, TOKEN_SECRET);

                    return response.header("auth-token", token).send(token);
                });
        });
});

AuthRouter.get('/me', authMiddleware, (request, response) => {
    if (get(request, 'user.id')) {
        sequelize.models.User.findOne({ where: { "id": get(request, 'user.id') } })
            .then((user) => {
                if(!user) {
                    return response.status(404).send("server.error.notFound.user");
                }

                return response.status(200).json({
                    ...get(request, 'user'),
                    id: get(user, 'id'),
                    firstName: get(user, 'firstName'),
                    lastName: get(user, 'lastName'),
                    email: get(user, 'email'),
                });
            })
    } else {
        return response.status(404).send("server.error.notFound.user");
    }
});

export default AuthRouter;
