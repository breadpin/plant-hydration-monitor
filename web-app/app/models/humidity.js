'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Humidity extends Model {
        static associate(models) {
        Moisture.belongsTo(models.Plant, {
            foreignKey: "plantId",
            as: 'plant',
            onDelete: 'cascade',
            foreignKey: { allowNull: false },
            hooks: true,
        });
        }
  }
    Humidity.init({
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
        humidity: { type: DataTypes.INTEGER, allowNull: false }
    }, {
        sequelize,
        modelName: 'Humidity',
    });
    return Moisture;
};