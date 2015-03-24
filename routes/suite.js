var debug         = require('debug')('wptc:routes_suite');
var express       = require('express');
var router        = express.Router();
var _             = require('lodash');
var request       = require('request');
var async       = require('async');
var Qs = require('qs')

/**
 * Get all the charts for a suite
 */
router.get('/:suiteId', function(req, res) {
  
  async.parallel([
    function(callback) {
      var url = process.env.WPT_API + '/tests/' + req.params.suiteId + '?' + Qs.stringify(req.query);
      request(url , function(err, response, data) {
        callback(null, JSON.parse(data));
      });
    },
    function(callback) {
      request(process.env.WPT_API + '/suite_config', function(err, response, data){
        callback(null, JSON.parse(data));
      });

    }
  ],
  function(err, results) {

    var data  = {
          _: _,
          pageTitle: results[0].suiteConfig.suiteDisplayName,
          suite: results[0],
          chartData: JSON.stringify(results[0].charts),
          masterConfig: results[1],
          chartSettings: Qs.stringify(req.query)
        };

        debug('data for suite');
        debug(data);

        res.render('suite', data);
  });
});

/**
 * Get the details for a specific test
 */
router.get('/:suiteId/:testId/:datapointId', function(req, res) {

  async.parallel([
    function(callback) {
      var url = process.env.WPT_API + '/tests/' +
          req.params.suiteId + '/' + req.params.testId + '/' +
          req.params.datapointId + '?' + Qs.stringify(req.query);
      request(url, function(err, response, data) {
        callback(null, JSON.parse(data));
      });
    },
    function(callback) {
      request(process.env.WPT_API + '/suite_config', function(err, response, data){
        callback(null, JSON.parse(data));
      });

    }
  ],
  function(err, results) {

    var data       = {
          _: _,
          pageTitle: results[0].datapointId,
          datapoint: results[0],
          chartData: JSON.stringify([results[0].chart]),
          masterConfig: results[1],
          fileHost: process.env.WPT_API,
          chartSettings: Qs.stringify(req.query)
        };

        debug('data for datapoint');
        debug(data);
        console.log(data)

        res.render('test', data);
  });
});

module.exports = router;