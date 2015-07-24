var debug         = require('debug')('wptc:routes_suite');
var express       = require('express');
var router        = express.Router();
var _             = require('lodash');
var request       = require('request');
var async       = require('async');
var moment       = require('moment');
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
    var testResults = results[0].testResults
      , data       = {
          _: _,
          pageTitle: results[0].testConfig.testDisplayName,
          testDate: moment(testResults.data.completed * 1000).format('MMM D, YYYY \a\t h:mm a'),
          datapoint: results[0],
          filmstrips: [
            buildFilmstrip(testResults.data.runs[1].firstView.videoFrames),
            buildFilmstrip(testResults.data.runs[1].repeatView.videoFrames)
          ],
          chartData: JSON.stringify([results[0].chart]),
          masterConfig: results[1],
          fileHost: process.env.WPT_API,
          chartSettings: Qs.stringify(req.query)
        };

        debug('data for datapoint');
        debug(data);

        res.render('test', data);
  });
});

function buildFilmstrip(testFrames) {
  var frames = []
  var incr = 0;
  var prevFrame;

  while (testFrames.length) {
    //get the first frame in the timeslot
    var frame = _.assign({incr: incr}, _.first(_.remove(testFrames, function(n){
      return n.time <= incr;
    })));

    //if no frame, use prev
    if (!frame.time) {
      frame = _.defaults(frame, prevFrame);
      frame.css = 'frameSame';
    } else {
      frame.css = 'frameChange';
    }

    frames.push(frame);

    //tick
    prevFrame = frame;
    incr = incr + 500;
  }

  return frames;
}

module.exports = router;
