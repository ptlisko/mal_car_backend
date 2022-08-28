import Joi from '@hapi/joi';

export const validateRegistration = (data: Record<any, any>) => {
    const schema = Joi.object({
        firstName: Joi.string()
            .min(2)
            .required(),
        lastName: Joi.string()
            .min(2)
            .required(),
        email: Joi.string()
            .min(6)
            .required()
            .email(),
        password: Joi.string()
            .min(6)
            .required()
    });

    return schema.validate(data);
};

export const validateLogin = (data: Record<any, any>) => {
    const schema = Joi.object({
        email: Joi.string()
            .min(6)
            .required()
            .email(),
        password: Joi.string()
            .min(6)
            .required()
    });
    return schema.validate(data);
};
