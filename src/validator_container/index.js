const ValidationError = require('../error/validation');

module.exports = class {
    constructor(schemaDir, Validator) {
        this._schemaDir = schemaDir;
        this._validator = new Validator();
        this._schemaCache = new Map();
    }

    getSchema(command) {
        if(!command) throw new Error('command must be provided.');
        let schema;
        try {
            schema = this._schemaCache.get(`${this._schemaDir}/${command}`);
            if (schema === undefined) {
                schema = require(`${this._schemaDir}/${command}`);
                this._schemaCache.set(`${this._schemaDir}/${command}`, schema);
            }
        }
        catch(err) {
            throw new Error(`invalid schema ${command}, error: ${err.stack}`)
        }

        if (schema.request === undefined 
            || schema.response === undefined 
            || (typeof schema.info !== 'object')) {
            throw new Error(`bad format of schema ${command}, expecting schema to have properties request, response and info.`);
        }
        return {
            info: schema.info,
            constant: schema.constant,
            request: schema.request,
            response: schema.response
        };
    }

    requestCheck({command, instance, schema}) {
        try {
            this._validator.requestCheck({command, instance, schema: schema.request})
        }
        catch (error) {
            throw new ValidationError(error.message, {command, instance, schema, side: "request"});            
        }
    }

    responseCheck({command, instance, schema}) {
        try {
            this._validator.responseCheck({command, instance, schema: schema.response})
        }
        catch (error) {
            throw new ValidationError(error.message, {command, instance, schema, side: "response"});            
        }
    }

}