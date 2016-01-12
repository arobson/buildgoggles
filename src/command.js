var _ = require( "lodash" );
var exec = require( "child_process" ).exec;
var when = require( "when" );

function executeCommand( line, path ) {
	path = path || __dirname;
	return when.promise( function( resolve, reject ) {
		var command = _.isArray( line ) ? line.join( " " ) : line;
		exec( command,
			{ cwd: path },
			function( err, stdout /*, stderr */ ) {
				if ( err ) {
					reject( { error: err, output: stdout } );
				} else {
					resolve( stdout );
				}
			} );
	} );
}

module.exports = executeCommand;
