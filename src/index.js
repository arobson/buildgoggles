var fs = require( "fs" );
var path = require( "path" );
var format = require( "util" ).format;
var when = require( "when" );
var git = require( "./git" );

function getInfo( options ) {
  var args = options || {};
  var repo = args.repo || process.cwd();
  var tag = args.tags || [ "o_r_b_v_c_s" ];
  console.log( format( "Getting build information for repository at '%s'", repo ) );
  return git.repo( repo, tag )
    .then( onInfo, onError );
}

function onInfo( info ) {
  return when.promise( function( resolve, reject ) {
  	var filePath = path.join( info.path, ".buildinfo.json" );
  	fs.writeFile( filePath, JSON.stringify( info ), function( err ) {
  		if ( err ) {
  			console.error( "Failed to write to", filePath );
        reject( err );
  		} else {
  			console.log( filePath, "written successfully" );
        resolve( info );
  		}
  	} );
  } );
}

function onError( err ) {
	var message = err.error ? err.error.message : err.stack;
	console.error( "Could not get build information due to", message );
}

module.exports = {
  getInfo: getInfo
};
