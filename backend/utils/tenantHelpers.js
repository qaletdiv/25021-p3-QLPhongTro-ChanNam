const { Tenant, Contract } = require("../models");

exports.findTenantByUser = (userId) => Tenant.findOne({ where: { userId } });

exports.findActiveContract = (tenantId, include) =>
    Contract.findOne({ where: { tenantId, status: 'active' }, include });

exports.findActiveContracts = (tenantId, include) =>
    Contract.findAll({ where: { tenantId, status: 'active' }, include });

exports.resolveContract = async (tenantId, contractId, include) => {
    if (contractId) {
        const contract = await Contract.findOne({
            where: { id: contractId, tenantId },
            include,
        });
        if (contract) return contract;
    }
    return findActiveContract(tenantId, include);
};
