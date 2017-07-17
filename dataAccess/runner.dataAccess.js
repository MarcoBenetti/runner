
let db = require('../configs/postgresql.config').db;

let saveRunnerTime = function(raceId, athleteId, time, verified) {
    return new Promise(function(resolve, reject){
        
        let query = `INSERT INTO race (race_id, athlete_id, time, verified) 
                     VALUES ($1, $2, $3, $4)`;

        db.result(query, [raceId, athleteId, time, verified])
            .then(function(result) {
                resolve(result);
            }).catch(function(err) {
                console.log(err);
                reject(err);
            });
    });
}

let getRunners = function() {
    return new Promise(function(resolve, reject){
        
        let query = `SELECT race_id, athlete_id, time, verified
                     FROM race`;

        db.manyOrNone(query)
            .then(function(result) {
                resolve(result);
            }).catch(function(err) {
                console.log(err);
                reject(err);
            });
    });
}

let getRunner = function(id) {
    return new Promise(function(resolve, reject){
        
        let query = `SELECT race_id, athlete_id, time, verified
                     FROM race
                     WHERE athlete_id = $1`;

        db.manyOrNone(query, [id])
            .then(function(result) {
                resolve(result);
            }).catch(function(err) {
                console.log(err);
                reject(err);
            });
    });
}

let patchValidTime = function(raceId, athleteId) {

    return new Promise(function(resolve, reject){
        
        let query = `UPDATE race
                     SET verified = true
                     WHERE race_id = $1 AND athlete_id = $2`;

        db.manyOrNone(query, [raceId, athleteId])
            .then(function(result) {
                resolve(result);
            }).catch(function(err) {
                console.log(err);
                reject(err);
            });
    });

}

let patchInvalidTime = function(raceId, athleteId) {
    return new Promise(function(resolve, reject){
        
        let query = `UPDATE race
                     SET verified = true, time = null
                     WHERE race_id = $1 AND athlete_id = $2`;

        db.manyOrNone(query, [raceId, athleteId])
            .then(function(result) {
                resolve(result);
            }).catch(function(err) {
                console.log(err);
                reject(err);
            });
    });
}

module.exports = {
    saveRunnerTime,
    getRunners,
    getRunner,
    patchValidTime,
    patchInvalidTime
}