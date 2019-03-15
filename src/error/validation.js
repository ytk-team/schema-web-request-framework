module.exports = class Validation extends Error {
    constructor(message, {command, instance, schema}) {
        super(message);
        this._command = command;
        this._instance = instance;
        this._schema = schema;
    }

    get command() {
        return this._command;
    }

    get instance() {
        return this._instance;
    }

    get schema() {
        return this._schema;
    }
}