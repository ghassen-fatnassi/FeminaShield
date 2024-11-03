import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../db.js';
import { User } from '../user/user.model.js';

export class Roadmap extends Model {
    declare id: number;
    declare description: string;
    declare title: string;
    declare userId: number; 
}

Roadmap.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    description: {
        type: DataTypes.STRING
    },
    title: {
        type: DataTypes.STRING
    },
    userId: { 
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'id'
        }
    }
}, { sequelize });


User.hasMany(Roadmap, { foreignKey: 'userId' });
Roadmap.belongsTo(User, { foreignKey: 'userId' });
