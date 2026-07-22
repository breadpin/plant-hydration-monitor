'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Temperature extends Model {
        static associate(models) {
        Temperature.belongsTo(models.Plant, {
            foreignKey: "plantId",
            as: 'plant',
            onDelete: 'cascade',
            foreignKey: { allowNull: false },
            hooks: true,
        });
        }
  }
    Temperature.init({
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
        temperature: { type: DataTypes.INTEGER, allowNull: true }
    }, {
        sequelize,
        modelName: 'Temperature',
    });
    return Temperature;
};