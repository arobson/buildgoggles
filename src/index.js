var fs = require( "fs" );
var path = require( "path" );
var root = process.argv.length > 2 ? path.resolve( process.argv[ 2 ] ) : path.resolve( process.cwd() );
var format = require( "util" ).format;
var argv = require( "yargs" ).default( { tag: "o_r_b_v_c_s" } ).argv;
var git = require( "./git" );

console.log( format( "Getting build information for repository at '%s'", root ) );

function onInfo( info ) {
	var filePath = path.join( root, ".buildinfo.json" );
	fs.writeFile( filePath, JSON.stringify( info ), function( err ) {
		if ( err ) {
			console.error( "Failed to write to", filePath );
		} else {
			console.log( filePath, "written successfully" );
		}
	} );
}

function onError( err ) {
	var message = err.error ? err.error.message : err.stack;
	console.error( "Could not get build information due to", message );
}

git.repo( root, argv.tag )
	.then( onInfo, onError );
