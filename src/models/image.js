module.exports = (sequelize, DataTypes) => {
  const Image = sequelize.define(
    'Image',
    {
      link: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      defaultScope: {
        attributes: { exclude: [] },
      },
    },
  );
  Image.associate = (models) => {
    Image.belongsTo(models.User, {
      foreignKey: 'userId',
      onDelete: 'cascade',
      onUpdate: 'no action',
      as: 'user',
    });
  };
  return Image;
};
