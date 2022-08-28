import { Sequelize } from 'sequelize';
import Promise from 'bluebird';

import UserModel from 'src/Models/User';
// import InitializeUser from 'src/Models/User/initialize';

export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './src/Database/database.sqlite3'
});

const Database = () => {
    return new Promise((resolve, reject) => {
        sequelize.authenticate()
            .then(() => {
                UserModel();
                sequelize.sync()
                    .then((_database) => {
                        return resolve(_database);
                    }).catch((error) => {
                        return reject(error);
                    });
            }).catch((error) => {
                return reject(error);
            });
    });
};

export default Database;