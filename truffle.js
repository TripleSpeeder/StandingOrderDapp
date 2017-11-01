module.exports = {
    migrations_directory: "./migrations",
    networks: {
        development: {
            host: "localhost",
            port: 8546,
            network_id: "*"
        },
        live: {
            host: "localhost",
            port: 8545,
            network_id: 1,
            from: '0xc81c8dfbb52b145eac415b431b36b918cdd0741f',
        },
        Ropsten: {
            host: "localhost",
            port: 8547,
            network_id: 3,
            gasprice: 23000000000,  // 23 gwei
        },
        Kovan: {
            host: "localhost",
            port: 8548,
            network_id: 42,
            gasprice: 23000000000,  // 23 gwei
        },
        Rinkeby: {
            host: "localhost",
            port: 8549,
            network_id: 4,
        }
    },
    mocha: {
        reporter: 'eth-gas-reporter'
    }
}
