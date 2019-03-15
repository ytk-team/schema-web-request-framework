const Transport = require("./transport");
const ValidatorContainer = require('../validator_container');
const DefaultValidator = require('../validator/default');

module.exports = class extends Transport{
    constructor({protocol, host, port, path, schemaDir, Validator = DefaultValidator}) {
        super({protocol, host, port, path});
        this._schemaDir = schemaDir;
        this._validator = new ValidatorContainer(schemaDir, Validator);
    }

    async call(command, request, timeout = 30000) {
        let commandSchema = this._validator.getSchema(command);
        this._validator.requestCheck({command, instance: request, schema: commandSchema});
        let response = await this.run(command, request, timeout);
        this._validator.responseCheck({command, instance: response, schema: commandSchema});
        return response;
    }
}