function addVectors (vectorA, vectorB) {
    return vectorA.map((a, index) => a + vectorB[index])
}

function squaredSpaceToRegular (coordinates) {
    return coordinates.map(i => i < 0 ? -1 * Math.sqrt(Math.abs(i)) : Math.sqrt(i))
}

function getPosition (currentTime, ship) {
    const {
        mass,
        maxVelocity,
        engine
    } = ship
    const {
        startPosition,
        startTime,
        targetVector
    } = ship.heading
    const progress = currentTime - startTime
    const movement = targetVector.map(target => target * progress * progress / 1000000)
    return addVectors(startPosition, squaredSpaceToRegular(movement))
}

function getVector (targetCoordinates) {
    const sqrd = targetCoordinates.map(i => i * i)
    const sqrtTotal = sqrd.reduce((prev, current) => {
        return prev + current
    }, 0)
    return targetCoordinates.map((target, index) => target < 0 ? -1 * sqrd[index] / sqrtTotal : sqrd[index] / sqrtTotal)
}

function getHeading (currentTime, ship, targetCoordinates) {
    const targetVector = getVector(targetCoordinates)
    let position
    if (ship.heading) {
        position = getPosition(currentTime, ship.heading)
    } else {
        position = ship.position
    }

    return {
        startTime: currentTime,
        startPosition: position,
        targetVector
    }
}

module.exports = {
    getPosition,
    getVector,
    getHeading
}
