import { sequelize } from "src/Database";
import Model from "./model";

const UserModel = () => {
    return sequelize.define('User', Model);
};

export default UserModel;