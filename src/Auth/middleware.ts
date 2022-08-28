import { Request, Response, NextFunction } from 'express';

import jsonwebtoken from 'jsonwebtoken';

const TOKEN_SECRET = 'asdasdrfxfdgsdfg';

const authMiddleware = (request: Request, response: Response, next: NextFunction) => {
    const token = request.header('Authentication');
    if(!token) {
        return response.status(401).send("Access Denied");
    }

    try {
        const user = jsonwebtoken.verify(token, TOKEN_SECRET);
        if(user) {
            // @ts-ignore
            request.user = user;
        }
        next();
    } catch(e){
        response.status(400).send("Invalid credentials");
    }
};

export default authMiddleware;