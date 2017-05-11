var glob = require( "globulesce" );
var path = require( "path" );
var fs = require( "fs" );
var format = require( "util" ).format;

function parseErlangVersion( content ) {
	var regex = /[{]\W?vsn[,]\W?\"([0-9.]+)\"/;
	var matches = regex.exec( content );
	return matches[ 1 ] ? matches[ 1 ] : undefined;
}

function parseNodeVersion( content ) {
	var json = JSON.parse( content );
	return json.version.split( "-" )[ 0 ];
}

function parseDotNetVersion( content ) {
	var regex = /^\[assembly:\W?[aA]ssemblyVersion(Attribute)?\W?\(\W?\"([0-9.]*)\"\W*$/m;
	var matches = regex.exec( content );
	return matches[ 2 ] ? matches[ 2 ] : undefined;
}

var parsers = {
	".src": parseErlangVersion,
	".json": parseNodeVersion,
	".cs": parseDotNetVersion
};

var searchPaths = [
	"{.,**}/package.json",
	"{.,**}/*.app.src",
	"{.,**}/AssemblyInfo.cs"
];

var searchTemplates = {
	".src": '[{]\\W?vsn[,]\\W?"%s"',
	".json": '"version"\\s*[:]\\s*"%s"',
	".cs": '^\\[assembly:\\W?[aA]ssemblyVersion(Attribute)?\\W?\\(\\W?"%s"\\W*$'
};

function getTemplate( filePath, version ) {
	var ext = path.extname( filePath );
	return format( searchTemplates[ ext ], version );
}

function getVersionFile( projectPath ) {
	var resolvedPath = path.resolve( projectPath );
	return glob( resolvedPath, searchPaths )
		.then( function( x ) {
			if ( x === undefined || x === null || x === {} || x === [] ) {
				return new Error( "None of the supported version specifiers could be found in " + resolvedPath );
			} else {
				return x[ 0 ];
			}
		}, function() {
			throw new Error( "Cannot search for version files in bad path \"" + projectPath + '"' );
		} );
}

function getVersion( filePath, content ) {
	if ( !content ) {
		content = fs.readFileSync( filePath ).toString();
	}
	var ext = path.extname( filePath );
	return parsers[ ext ]( content );
}

module.exports = {
	getFile: getVersionFile,
	getTemplate: getTemplate,
	getVersion: getVersion
};
