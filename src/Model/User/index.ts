import { Sequelize } from "sequelize";
import Model from "./model";

const UserModel = (sequelize: Sequelize) => {
    return sequelize.define('User', Model);
};

export default UserModel;