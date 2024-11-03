import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../db.js';

export class User extends Model {
    declare id: number;
    declare username: string;
    declare password: string;
    declare isAdmin: boolean;
}

User.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
    },
    isAdmin: {
        type: DataTypes.BOOLEAN,
    }
}, { sequelize });

export const associateUser = (models) => {
    User.hasMany(models.Roadmap, { foreignKey: 'userId' });
};
