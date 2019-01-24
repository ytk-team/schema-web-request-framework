const WebError = require('../../../../').Error;

module.exports = async ({request, session, constant}) => {
    throw new WebError("web_error", 666);
};
