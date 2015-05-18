var mongoose   = require('mongoose');
var config     = require('config');
var semver     = require('semver');
var cfenv      = require('cfenv');


var connectionString = config.mongodb.connectionString || 'mongodb://' + config.mongodb.user + ':' + config.mongodb.password + '@' + config.mongodb.server +'/' + config.mongodb.database;
var appEnv = cfenv.getAppEnv();
var mongodbService = appEnv.getService(/.*mongodb.*/i);
if(mongodbService != null){
  console.log(mongodbService);
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
mongoose.connection.on('open', function (err) {
  mongoose.connection.db.admin().serverStatus(function(err, data) {
    if (err) {
      if (err.name === "MongoError" && (err.errmsg === 'need to login' || err.errmsg === 'unauthorized') && !config.mongodb.connectionString) {
        console.log('Forcing MongoDB authentication');
        mongoose.connection.db.authenticate(config.mongodb.user, config.mongodb.password, function(err) {
          if (!err) return;
          console.error(err);
          process.exit(1);
        });
        return;
      } else {
        console.error(err);
        process.exit(1);
      }
    }
    if (!semver.satisfies(data.version, '>=2.1.0')) {
      console.error('Error: Uptime requires MongoDB v2.1 minimum. The current MongoDB server uses only '+ data.version);
      process.exit(1);
    }
  });
});


module.exports = mongoose;
