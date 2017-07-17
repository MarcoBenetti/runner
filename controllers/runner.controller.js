
let runnerDataAccess = require('../dataAccess/runner.dataAccess');
let axios = require('axios');


let saveRunnerTime = async function(req, res) {

    let raceId = req.params.id;
    let athleteId = req.body.id;
    let time = req.body.time;
    
    //validation
    req.checkParams('id', 'Race ID is empty').notEmpty().isAlphanumeric();
    req.checkBody('id', 'Id must exist and between 1 and 150').notEmpty().isInt({gt: 0, lt: 151});
    req.checkBody('time', 'Invalid time').notEmpty().isInt();

    let errors = req.validationErrors();

    //return bad request errors
    if(errors) {
        res.status(400).send({success: false, statuscode: 400, message: errors});
        return;
    }

    try {
        //check if time is valid
        let result = await axios({method:'get', url:'https://run-check-2017.mvlabs.it/check/' + athleteId, timeout: 5000});

        //time not valid
        if(!result.data.valid) {
            let dbResult = await runnerDataAccess.saveRunnerTime(raceId, athleteId, null, true);
            res.status(201).send({success: true, statuscode: 201, message: "Athlete not signed correctly, time will be NULL"});
            return;
        }

        //athlete ok
        let dbResult = await runnerDataAccess.saveRunnerTime(raceId, athleteId, time, true);
        res.status(201).send({success: true, statuscode: 201});

    } catch (err) {

        //handling external service not available
        if(err.code === 'ECONNABORTED') {
            try {
                let dbResult = await runnerDataAccess.saveRunnerTime(raceId, athleteId, time, false);
                res.status(201).send({success: true, statuscode: 201, message: "Verification server not available, saving for future check"});
                return;
            } catch (err) {
                //handling duplicate insert
                if(err.routine === '_bt_check_unique') {
                    res.status(400).send({success: false, statuscode: 400, message: "Data altredy inserted"});
                    return;
                }
            }
            
        }

        //handling athlete not found by the external service
        if(err.status === 404) {
            res.status(404).send({success: false, statuscode: 404, message: "Athlete not found"});
            return;
        }

        //handling duplicate insert
        if(err.routine === '_bt_check_unique') {
            res.status(400).send({success: false, statuscode: 400, message: "Data altredy inserted"});
            return;
        }

        //handling all other errors
        res.status(500).send({success: false, statuscode: 500, message: "Internal server error"});
    }

};


let getRunners = async function(req, res) {

    let runnerId = req.params.id;

    try {

        let data = await runnerDataAccess.getRunners();

        res.status(200).send({success: true, data: data, statuscode: 200});

    } catch (err) {
        res.status(500).send({success: false, statuscode: 500, message: "Internal server error"});
    }
};


let getRunner = async function(req, res) {
    let runnerId = req.params.id;

    req.checkParams('id', 'Runner id must be Int').isInt();

    let errors = req.validationErrors();

    //return bad request errors
    if(errors) {
        res.status(400).send({success: false, statuscode: 400, message: errors});
        return;
    }

    try {

        let data = await runnerDataAccess.getRunner(runnerId);

        res.status(200).send({success: true, data: data, statuscode: 200});

    } catch (err) {
        res.status(500).send({success: false, statuscode: 500, message: "Internal server error"});
    }
};


let checkTime = async function(req, res) {

    let raceId = req.body.raceId;
    let athleteId = req.body.athleteId;
    
    //validation
    req.checkBody('raceId', 'Race ID is empty').notEmpty().isAlphanumeric();
    req.checkBody('athleteId', 'Id must exist and be between 1 and 150').notEmpty().isInt({gt: 1, lt: 150});

    let errors = req.validationErrors();

    //return bad request errors
    if(errors) {
        res.status(400).send({success: false, statuscode: 400, message: errors});
        return;
    }

    try {
        //check if time is valid
        let result = await axios({method:'get', url:'https://run-check-2017.mvlabs.it/check/' + athleteId, timeout: 5000});

        //time not valid
        if(!result.data.valid) {
            let dbResult = await runnerDataAccess.patchInvalidTime(raceId, athleteId);
            res.status(204).send();
            return;
        }

        //athlete ok
        let dbResult = await runnerDataAccess.patchValidTime(raceId, athleteId);
        res.status(204).send();

    } catch (err) {

        //handling external service not available
        if(err.code === 'ECONNABORTED') {
            res.status(201).send({success: true, statuscode: 404, message: "Verification server not available"});
            return;
        }

        //handling athlete not found by the external service
        if(err.status === 404) {
            res.status(404).send({success: false, statuscode: 404, message: "Athlete not found"});
            return;
        }

        //handling duplicate insert
        if(err.routine === '_bt_check_unique') {
            res.status(400).send({success: false, statuscode: 400, message: "Data altredy inserted"});
            return;
        }

        //handling all other errors
        res.status(500).send({success: false, statuscode: 500, message: "Internal server error"});
    }

};



module.exports = {
    saveRunnerTime,
    getRunners,
    getRunner,
    checkTime
};