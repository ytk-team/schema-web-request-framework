const Server = require('../../src/server');
const BusinessError = require('../..').BusinessError;

let demoMiddleware = {
    pattern: '(.*)', //match all interface
    handle: async ({name, schema, pyload/*{constant, state, request}*/}) => {
        // will be called before entering handler, can be used for authorization.
    }
};

let server = new Server({
    host: "127.0.0.1",
    port: 3005,
    handlerDir: `${__dirname}/handler`,
    schemaDir: `${__dirname}/../schema`,
    middlewares: [demoMiddleware],
    errorMiddleware: (error, request, response) => {
        if (error instanceof BusinessError) {
            response.status(666).json({code: error.code, message: error.message});
        }
        else {
            response.status(500).json({code: error.code || 0, message: error.message});
        }
    }
});

server.on("error", (err) => {
    console.log(err);
});
server.on("started", () => {
    console.log("server start....");
});

server.start();
