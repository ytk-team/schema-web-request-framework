const Express = require('express');
const JsonBodyParser = require('./json_body_parser');
const StateParser = require('./state_parser');
const EventEmitter = require('events').EventEmitter;
const ValidatorContainer = require('../validator_container');
const DefaultValidator = require('../validator/default');

module.exports = class extends EventEmitter {

    constructor({host, 
        port, 
        handlerDir, 
        schemaDir, 
        middlewares = [],
        route = i => i,
        customResponseHandler = undefined,
        Validator = DefaultValidator
    }) {
        super();
        this._host = host;
        this._port = port;
        this._app = new Express();
        this._app.use(JsonBodyParser);
        this._validator = new ValidatorContainer(schemaDir, Validator);
        this._app.post('/*', this._executor(handlerDir, middlewares, route));
        //成功请求进入此逻辑
        this._app.use(async(request, response, next) => {
            if (customResponseHandler !== undefined) {
                await customResponseHandler(null, request._payload, response._outgoing, response);
            }
            else {
                response.status(200).json({response: response._outgoing});
            }
            this.emit('request_end', request._payload.name);
        });
        //抛错进入以下逻辑
        this._app.use(async(err, request, response, next) => {
            this.emit('server_error', err);
            if (customResponseHandler !== undefined) {
                await customResponseHandler(err, request._payload, response._outgoing, response);
            }
            else {
                response.status(500).json({code: err.code || 0, message: err.message});
            }
        });
    }
    
    start() {
        let httpServer = this._app.listen(this._port, this._host);
        this.emit("started");
        return httpServer;
    }

    _executor(handlerDir, middlewares, route) {
        return async (req, res, next) => {
            try {
                let command = route(req.originalUrl.replace(/^\//, ''));

                req._payload = {
                    command,
                    state: StateParser(req),
                    request: req.body.request,
                    headers: req.headers
                };


                this.emit('request_start', command);
                
                let commandSchema = this._validator.getSchema(command);
                req._payload.constant = commandSchema.constant;

                for (let middleware of middlewares) {
                    let regex = new RegExp(middleware.pattern);
                    if (regex.test(command)) {
                        await middleware.handle({
                            name: command,
                            schema: commandSchema,
                            payload: req._payload
                        });
                    }
                }

                this._validator.requestCheck({command, instance: req._payload.request, schema: commandSchema});
                let outgoing = await require(`${handlerDir}/${command}`)(req._payload);
                if(outgoing === undefined) outgoing = null;
                this._validator.responseCheck({command, instance: outgoing, schema: commandSchema});
                res._outgoing = outgoing;
                next();
            }
            catch(err) {
                next(err);
            }
        }
    }

}