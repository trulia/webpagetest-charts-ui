var debug      = require('debug')('wptc:routes_home');
var express    = require('express');
var router     = express.Router();
var _          = require('lodash');
var request    = require('request');

/* GET home page. */
router.get('/', function(req, res) {
  console.log(process.env.WPT_API + req.query.asset)
  request(process.env.WPT_API + req.query.asset).pipe(res);
});

module.exports = router;