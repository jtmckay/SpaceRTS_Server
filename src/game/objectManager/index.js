const uuid = require('uuid/v4')
const { getHeading, getPosition } = require('./movement')

function objectManagerFactory (io) {
    const internal = {
        gameTime: null,
        planets: {},
        stations: {},
        ships: {}
    }

    function startGame () {
        internal.gameTime = Date.now()
        io.sockets.emit('game_time', internal.gameTime)
    }

    function resetGame () {
        internal.planets = {}
        internal.stations = {}
        internal.planets = {}
        internal.ships = {}
        io.sockets.emit('game_time', null)
        io.sockets.emit('clear_all')
    }

    function streamFullGameState (socket) {
        socket.emit('game_time', internal.gameTime)
        Object.values(internal.planets).forEach(planet => socket.emit('planet_add', planet))
        Object.values(internal.stations).forEach(station => socket.emit('station_add', station))
        Object.values(internal.ships).forEach(ship => socket.emit('ship_add', ship))
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
        internal.planets[id] = planet
        io.sockets.emit('planet_add', planet)
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
        internal.stations[id] = station
        io.sockets.emit('station_add', station)
        return station
    }

    /*
        params: {
            ownerId: string,
            type: string,
            color: Array(number),
            position: Array(number),
            trajectory: Array(number),
            heading: Array(number)
        }
    */
    function addShip (params, trajectory) {
        const id = uuid()
        const ship = {
            id,
            ...params
        }
        if (trajectory) {
            ship.heading = getHeading(Date.now(), ship, trajectory)
        }
        internal.ships[id] = ship
        io.sockets.emit('ship_add', ship)
        return ship
    }

    function moveShips (ownerId, shipIds, heading) {
        shipIds.forEach(ship => moveShip(ownerId, ship, heading))
    }

    function moveShip (ownerId, shipId, targetCoordinates) {
        const ship = internal.ships[shipId]
        if (!ship || ship.ownerId !== ownerId) {
            console.log('Not the owner', ownerId, ship)
            return
        }
        let currentTime = Date.now()

        const heading = getHeading(currentTime, ship, targetCoordinates)
        ship.heading = heading
        ship.position = heading.startPosition
        io.sockets.emit('ship_movement_start', {
            id: shipId,
            heading
        })
    }

    function stopShips (ownerId, shipIds) {
        shipIds.forEach(shipId => stopShip(ownerId, shipId))
    }

    function stopShip (ownerId, shipId) {
        const ship = internal.ships[shipId]
        if (!ship || ship.ownerId !== ownerId) {
            console.log('Not the owner', ownerId, ship)
            return
        }
        if (!ship.heading) {
            console.log('Ship is already stopped')
            return
        }
        
        let currentTime = Date.now()
        ship.position = getPosition(currentTime, ship)
        delete ship.heading
        io.sockets.emit('ship_movement_stop', {
            id: shipId,
            position: ship.position
        })
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
        moveShip,
        stopShip,
        stopShips
    }
}

module.exports = objectManagerFactory
