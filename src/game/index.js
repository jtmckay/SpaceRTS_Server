const objectManagerFactory = require('./objectManager')

const constants = {
    position: [
        [106000, 0, -106000],
        [0, 0, -150000],
        [-106000, 0, -106000],
        [-150000, 0, 0],
        [-106000, 0, 106000],
        [0, 0, 150000],
        [106000, 0, 106000],
        [150000, 0, 0]
    ],
    color: [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
        [1, 1, 0],
        [0, 1, 1],
        [1, 0, 1],
        [1, .5, 0],
        [0, .5, 1]
    ]
}

module.exports = function (io) {
    let messages = []
    let players = []
    const objectManager = objectManagerFactory(io)

    function setupGame (gameSetup) {
        players.push(...gameSetup.players)
        players.forEach((player, index) => {
            const planet = {
                size: 2000,
                color: constants.color[index],
                position: constants.position[index]
            }
            objectManager.addPlanet(planet)

            const offset = 1500
            objectManager.addStation({
                owner: player.id,
                size: 10,
                color: constants.color[index],
                position: constants.position[index].map((i, index) => {
                    if (index === 1) {
                        return i + offset
                    }
                    return i - offset
                })
            })

            objectManager.addShip({
                owner: player.id,
                type: 'phoenix',
                color: constants.color[index],
                position: constants.position[index].map((i, index) => {
                    if (index === 1) {
                        return i + offset + 10
                    }
                    return i - offset - 10
                })
            })

            objectManager.addShip({
                owner: player.id,
                type: 'phoenix',
                color: constants.color[index],
                position: constants.position[index].map((i, index) => {
                    if (index === 0) {
                        return i - offset - 15
                    }
                    if (index === 1) {
                        return i + offset + 10
                    }
                    return i - offset - 10
                })
            })

            objectManager.addShip({
                owner: player.id,
                type: 'phoenix',
                color: constants.color[index],
                position: constants.position[index].map((i, index) => {
                    if (index === 0) {
                        return i - offset - 20
                    }
                    if (index === 1) {
                        return i + offset + 10
                    }
                    return i - offset - 10
                })
            })

            const trajectories = [
                [0, 0, 10000],
                [0, 2000, 10000],
                [0, 4000, 10000],
                [0, 6000, 10000],
                [0, 8000, 10000],
                [0, 10000, 10000],
                [0, 10000, 8000],
                [0, 10000, 6000],
                [0, 10000, 4000],
                [0, 10000, 2000],
                [0, 10000, 0],
                [0, 10000, 0],
                [2000, 10000, 0],
                [4000, 10000, 0],
                [6000, 10000, 0],
                [8000, 10000, 0],
                [10000, 10000, 0],
                [10000, 8000, 0],
                [10000, 6000, 0],
                [10000, 4000, 0],
                [10000, 2000, 0],
                [10000, 0, 0],
                [-0, -0, -10000],
                [-0, -2000, -10000],
                [-0, -4000, -10000],
                [-0, -6000, -10000],
                [-0, -8000, -10000],
                [-0, -10000, -10000],
                [-0, -10000, -8000],
                [-0, -10000, -6000],
                [-0, -10000, -4000],
                [-0, -10000, -2000],
                [-0, -10000, -0],
                [-0, -10000, -0],
                [-2000, -10000, -0],
                [-4000, -10000, -0],
                [-6000, -10000, -0],
                [-8000, -10000, -0],
                [-10000, -10000, -0],
                [-10000, -8000, -0],
                [-10000, -6000, -0],
                [-10000, -4000, -0],
                [-10000, -2000, -0],
                [-10000, -0, -0]
            ]

            const shipGroup = trajectories.map(num => {
                return objectManager.addShip({
                    owner: player.id,
                    type: 'phoenix',
                    color: constants.color[index],
                    position: constants.position[index].map((i, index) => {
                        if (index === 0) {
                            return i - offset - 30
                        }
                        if (index === 1) {
                            return i + offset + 10
                        }
                        return i - offset - 10
                    }),
                    mass: 1000,
                    maxVelocity: 200,
                    engine: 100
                })
            })

            shipGroup.forEach((ship, index) => {
                objectManager.moveShip(ship.id, trajectories[index])
            })
        })
    }

    function handleSocket (socket) {
        socket.on('game_connect', () => {
            if (objectManager.internal.gameTime) {
                objectManager.streamFullGameState(socket)
            }
        })

        socket.on('game_start', (gameSetup, callback) => {
            if (gameSetup.id) {
                setupGame(gameSetup)
                objectManager.startGame()
                callback(true)
            }
        })

        socket.on('game_end', (gameSetup, callback) => {
            messages = []
            players = []
            objectManager.resetGame()
            callback(true)
        })

        socket.on('command_units_vector_heading', ({ id, unitsToOrder, target }, callback) => {
            if (id) {
                objectManager.moveShips(unitsToOrder, target)
                callback(true)
            }
        })
    }

    return {
        handleSocket
    }
}
