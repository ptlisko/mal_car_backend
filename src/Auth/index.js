import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken';

import { sequelize } from 'src/Database';

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
                return response.status(400).send("A User account with this email already exists");
            }

            bcrypt.genSalt(10)
                .then((salt) => {
                    bcrypt.hash(request.body.password, salt)
                        .then((hashedPassword) => {
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
                                        new_user_id: savedUser.id,
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
            bcrypt.compare(request.body.password, user.password)
                .then((validPassword) => {
                    if (!validPassword) {
                        return response.status(400).send("server.error.invalid.password");
                    }

                    const token = jsonwebtoken.sign({
                        id: user.id,
                        exp: Math.floor(Date.now() / 1000) + (60 * 1000),
                    }, TOKEN_SECRET);

                    return response.header("auth-token", token).send(token);
                });
        });
});

export default AuthRouter;
