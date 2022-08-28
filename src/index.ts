import express, { urlencoded, json, request, response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import Database from './Database';

import AuthRouter from 'src/Auth';

const Server = express();
const PORT = 8080;

Server.use(cors());
Server.use(urlencoded({ extended: false }));
Server.use(json());
Server.use(cookieParser());

Server.use('/', (_, response) => {
    return response.json('Hello fucking server');
});

Server.use('/api/suth', AuthRouter);

Database()
    .then((_database) => {
        console.log('Database started ', _database);
        Server.listen(PORT, () => {
            console.log(`Server started at port ${PORT}`);

        });
    })
    .catch((error: string) => {
        console.log('Database failure, reason ', error);
    });


