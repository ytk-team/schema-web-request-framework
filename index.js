module.exports = {
    Server: require("./src/server"),
    Client: require("./src/client"),
    BusinessError: require("./src/error/business"),
    ValidationError: require("./src/error/validation")
}