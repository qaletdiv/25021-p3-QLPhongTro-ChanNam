module.exports = (sequelize, DataTypes) => {
    const BuildingCollaborator = sequelize.define("BuildingCollaborator", {
        buildingId: { type: DataTypes.INTEGER, allowNull: false },
        userId: { type: DataTypes.INTEGER, allowNull: false },
    }, {
        tableName: "building_collaborators",
        indexes: [
            { unique: true, name: "uq_bc_building_user", fields: ["buildingId", "userId"] },
        ],
    });

    BuildingCollaborator.associate = (db) => {
        BuildingCollaborator.belongsTo(db.User, { as: "user", foreignKey: "userId" });
        BuildingCollaborator.belongsTo(db.Building, { as: "building", foreignKey: "buildingId" });
    };

    return BuildingCollaborator;
};
