import { Sequelize } from 'sequelize';
import Promise from 'bluebird';

import UserModel from '../Model/User';

export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './src/Database/database.sqlite3'
});

const Database = () => {
    return new Promise((resolve: (thenableOrResult?: unknown) => void, reject: (error?: any) => void) => {
        sequelize.authenticate()
            .then(() => {
                UserModel(sequelize);
                sequelize.sync()
                    .then(() => {
                        return resolve();
                    }).catch((error) => {
                        return reject(error);
                    });
            }).catch((error) => {
                return reject(error);
            });
    });
};

export default Database;