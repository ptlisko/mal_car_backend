import { Sequelize } from 'sequelize';

const Initialize = (_database: Sequelize) => {
    return _database.models.User.create({ email: '01laky@gmail.com' })
        .then((user: Record<any, any>) => {
            console.log("Initialize user success => ", user)
        })
        .catch((error) => {
            console.log("Initialize user fail => ", error)
        });
};

export default Initialize;