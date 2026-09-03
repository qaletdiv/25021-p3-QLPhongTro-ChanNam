const { Tenant, Contract } = require("../models");

exports.findTenantByUser = (userId) => Tenant.findOne({ where: { userId } });

exports.findActiveContract = (tenantId, include) =>
    Contract.findOne({ where: { tenantId, status: 'active' }, include });

exports.findActiveContracts = (tenantId, include) =>
    Contract.findAll({ where: { tenantId, status: 'active' }, include });
