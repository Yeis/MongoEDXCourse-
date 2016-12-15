var express = require('express');
var wagner = require('wagner-core');
var config = require('config.json');
require('./models')(wagner);
require('./dependencies')(wagner);

var app = express();

wagner.invoke(require('./auth'), {   app: app , Config:config });

app.use('/api/v1', require('./api')(wagner));

app.listen(3000);
console.log('Listening on port 3000!');
