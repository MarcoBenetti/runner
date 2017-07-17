
const express = require('express');
const controller = require('../controllers/runner.controller');

let runner = express.Router();
runner.post('/:id', controller.saveRunnerTime);
runner.get('/:id', controller.getRunner);
runner.get('', controller.getRunners);
runner.patch('', controller.checkTime);

module.exports = runner;