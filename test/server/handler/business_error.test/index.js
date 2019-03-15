const BusinessError = require('../../../../').BusinessError;

module.exports = async ({request, session, constant}) => {
    throw new BusinessError("business_error", 666);
};
