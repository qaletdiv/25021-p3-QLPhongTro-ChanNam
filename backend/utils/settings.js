const { Setting } = require("../models");

exports.getResolvedSettings = async (landlordId, buildingId) => {
    const base = await Setting.findAll({ where: { landlordId, buildingId: null } });
    const result = {};
    base.forEach(s => { result[s.key] = s.value; });

    if (buildingId) {
        const overrides = await Setting.findAll({ where: { landlordId, buildingId } });
        overrides.forEach(s => { result[s.key] = s.value; });
    }

    return result;
};
