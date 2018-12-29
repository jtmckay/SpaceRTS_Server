const uuid = require('uuid/v4')

function objectManagerFactory (io) {
    const internal = {
        gameTime: null,
        planets: [],
        stations: [],
        ships: []
    }

    function startGame () {
        internal.gameTime = Date.now()
        io.sockets.emit('game_time', internal.gameTime)
    }

    function resetGame () {
        internal.planets = []
        internal.stations = []
        internal.planets = []
        internal.ships = []
        io.sockets.emit('game_time', null)
        io.sockets.emit('clear_all')
    }

    function streamFullGameState (socket) {
        socket.emit('game_time', internal.gameTime)
        internal.planets.forEach(planet => socket.emit('planet', planet))
        internal.stations.forEach(station => socket.emit('station', station))
        internal.ships.forEach(ship => socket.emit('ship', ship))
    }

    /*
        params: {
            size: number,
            color: Array(number),
            position: Array(number)
        }
    */
    function addPlanet (params) {
        const id = uuid()
        const planet = {
            id,
            ...params
        }
        internal.planets.push(planet)
        io.sockets.emit('planet', planet)
        return planet
    }

    /*
        params: {
            owner: string,
            size: number,
            color: Array(number),
            position: Array(number)
        }
    */
    function addStation (params) {
        const id = uuid()
        const station = {
            id,
            ...params
        }
        internal.stations.push(station)
        io.sockets.emit('station', station)
        return station
    }

    /*
        params: {
            owner: string,
            type: string,
            color: Array(number),
            position: Array(number),
            trajectory: Array(number),
            heading: Array(number)
        }
    */
    function addShip (params) {
        const id = uuid()
        const ship = {
            id,
            ...params
        }
        internal.ships.push(ship)
        io.sockets.emit('ship', ship)
        return ship
    }

    function moveShips (shipIds, heading) {
        shipIds.forEach(ship => moveShip(ship, heading))
    }

    function moveShip (shipId, heading) {
        console.log('totally doing something', shipId, heading)
    }

    return {
        internal,
        startGame,
        resetGame,
        streamFullGameState,
        addPlanet,
        addStation,
        addShip,
        moveShips,
        moveShip
    }
}

module.exports = objectManagerFactory
