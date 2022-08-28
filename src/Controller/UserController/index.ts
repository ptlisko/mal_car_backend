import { Router } from 'express';
import { get, map, toNumber } from 'lodash';
import bcrypt from 'bcryptjs';
import moment from 'moment';

import { sequelize } from 'src/Database';

import authMiddleware from '../../Auth/middleware';

const UserRouter = Router();

UserRouter.post('/', authMiddleware, (request, response) => {
    sequelize.models.User.findOne({ where: { "id": get(request, 'body.email') } })
        .then((user) => {
            if (user) {
                return response.status(400).send("server.error.acount.alreadyExist");
            }
            bcrypt.genSalt(10)
                .then((salt) => {
                    bcrypt.hash(get(request, 'body.password'), salt)
                        .then((hashedPassword) => {
                            const newUser: Record<any, any> = {
                                email: get(request, 'body.email'),
                                firstName: get(request, 'body.firstName'),
                                lastName: get(request, 'body.firstName'),
                                password: hashedPassword
                            }
                            sequelize.models.User.create(newUser)
                                .then((savedUser) => {
                                    return response.status(200).json({
                                        id: get(savedUser, 'id'),
                                        firstName: get(savedUser, 'firstName'),
                                        lastName: get(savedUser, 'lastName'),
                                        email: get(savedUser, 'email'),
                                    });
                                }).catch((error) => {
                                    return response.status(500).send(error.message)
                                });
                        });
                });

        });
});

UserRouter.get('/', authMiddleware, (request, response) => {
    const query: Record<any, any> = {
        limit: get(request, 'query.limit'),
        offset: get(request, 'query.offset')
    };
    sequelize.models.User.findAll(query)
        .then((users) => {
            const mappedUsers = map(users, (user) => ({
                id: get(user, 'id'),
                firstName: get(user, 'firstName'),
                lastName: get(user, 'lastName'),
                email: get(user, 'email'),
                createdAt: moment(get(user, 'createdAt')).format("DD. MM. YYYY"),
                updatedAt: moment(get(user, 'updatedAt')).format("DD. MM. YYYY"),
            }));
            sequelize.models.User.count()
                .then((userCount) => {
                    return response.status(200).json({
                        count: userCount,
                        limit: toNumber(get(request, 'query.limit')),
                        offset: toNumber(get(request, 'query.offset')),
                        users: mappedUsers
                    });
                }).catch((error) => {
                    return response.status(500).send(error.message)
                });
        }).catch((error) => {
            return response.status(500).send(error.message)
        });
});

UserRouter.put('/:id', authMiddleware, (request, response) => {
    const userId = get(request, 'params.id');
    const updatedUser: Record<any, any> = {
        email: get(request, 'body.email'),
        firstName: get(request, 'body.email'),
        lastName: get(request, 'body.email'),
    };

    sequelize.models.User.update(updatedUser, { where: { id: userId } })
        .then((updatedUser) => {
            if (!updatedUser) {
                return response.status(404).send("server.error.notFound.user");
            }

            return response.status(200).json({
                id: get(updatedUser, 'id'),
                email: get(updatedUser, 'email'),
                firstName: get(updatedUser, 'email'),
                lastName: get(updatedUser, 'email'),
            });
        }).catch((error) => {
            return response.status(500).send(error.message)
        });
});

UserRouter.delete('/:id', authMiddleware, (request, response) => {
    const userId = get(request, 'params.id');
    const selfId = get(request, 'user.id');
    if (userId !== selfId) {
        return response.status(500).send('server.error.delete.notAllowed.user');
    }

    sequelize.models.User.destroy({ where: { id: userId } })
        .then(() => {
            return response.status(200).json({
                status: "Success",
            });
        }).catch((error) => {
            return response.status(500).send(error.message);
        });
});

export default UserRouter;
