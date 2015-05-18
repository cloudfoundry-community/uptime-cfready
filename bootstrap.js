var mongoose   = require('mongoose');
var config     = require('config');
var semver     = require('semver');
var cfenv      = require('cfenv');


var connectionString = config.mongodb.connectionString || 'mongodb://' + config.mongodb.user + ':' + config.mongodb.password + '@' + config.mongodb.server +'/' + config.mongodb.database;
var appEnv = cfenv.getAppEnv();
var mongodbService = appEnv.getService(/.*mongodb.*/i);
if(mongodbService != null){
  connectionString = mongodbService.credentials.url || mongodbService.credentials.uri;
  config.mongodb.user = mongodbService.credentials.username;
  config.mongodb.password = mongodbService.credentials.password;
}
// configure mongodb
mongoose.connect(connectionString);
mongoose.connection.on('error', function (err) {
  console.error('MongoDB error: ' + err.message);
  console.error('Make sure a mongoDB server is running and accessible by this application');
  process.exit(1);
});


module.exports = mongoose;
