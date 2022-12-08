"use strict";
const { Op, where } = require("sequelize");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    static associate(models) {
      Todo.belongsTo(models.User, {
        foreignKey: "userID",
      });
    }

  //This is to add a To Do item of a user with due date
    static async addaTodo({ title, dueDate, userID }) {
      return this.create({
        title: title,
        dueDate: dueDate,
        completed: false,
        userID,
      });
    }

    //This is to get To Do items that are due of a user 
    static async overDue(userID) {
      return await Todo.findAll({
        where: {
          dueDate: {
            [Op.lt]: new Date(),
          },
          userID,
          completed: false,
        },
        order: [["id", "ASC"]],
      });
    }

    //This is to get To Do items that are due today of a user 
    static async dueToday(userID) {
      return await Todo.findAll({
        where: {
          dueDate: {
            [Op.eq]: new Date(),
          },
          userID,
          completed: false,
        },
        order: [["id", "ASC"]],
      });
    }

    //This is to get To Do items thar are completed of a user 
    static async completedItemsAre(userID) {
      return await Todo.findAll({
        where: {
          completed: true,
          userID,
        },
      });
    }

    //This is to get To Do items that are due later of a user 
    static async dueLater(userID) {
      return await Todo.findAll({
        where: {
          dueDate: {
            [Op.gt]: new Date(),
          },
          userID,
          completed: false,
        },
        order: [["id", "ASC"]],
      });
    }

    //This is to remove a To Do item of a user 
    static async remove(id, userID) {
      return this.destroy({
        where: {
          id,
          userID,
        },
      });
    }

    //This is to get all To Do items of a user
    static async getTodos(userID) {
      return this.findAll({
        where: {
          userID,
        },
      });
    }

  //This is to update a To Do item
  setCompletionStatusAs(status) {
      return this.update({ completed: status });
    }
  }
  
  Todo.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: true,
          len: 5,
        },
      },
      dueDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          notNull: true,
        },
      },
      completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Todo",
    }
  );
  return Todo;
};
