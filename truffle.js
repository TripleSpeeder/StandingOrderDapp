module.exports = {
    migrations_directory: "./migrations",
    networks: {
        development: {
            host: "localhost",
            port: 8545,
            network_id: "6666" // RNG ;)
        },
        live: {
            host: "localhost",
            port: 8546,
            network_id: 1,
        },
        Ropsten: {
            host: "localhost",
            port: 8547,
            network_id: 3,
        },
        Rinkeby: {
            host: "localhost",
            port: 8548,
            network_id: 4,
        }
    }
}
