var debug      = require('debug')('wptc:routes_home');
var express    = require('express');
var router     = express.Router();
var _          = require('lodash');
var request    = require('request');

/* GET home page. */
router.get('/', function(req, res) {


  request(process.env.WPT_API + '/suite_config', function(err, response, rawJson){
    
    data = JSON.parse(rawJson);
    
    var pageData = {
      pageTitle: 'WebPageTest Test Suites',
      testSuites: data.testSuites,
      _: _
    };

    debug('data for homepage');
    debug(pageData);

    res.render('home', pageData);
  });
});

module.exports = router;