var fs = require( "fs" );
var path = require( "path" );
var format = require( "util" ).format;
var git = require( "./git" );
var cli = require( "commander" );
var yaml = require( "js-yaml" );
var packagePath = path.join( __dirname, "../package.json" );
var package = require( packagePath );
var root = cli.path || path.resolve( process.cwd() );

console.log( format( "Getting build information for repository at '%s'", root ) );

var buildFilePath = path.resolve( "./.drone.yml" );
var buildFile = {};
if( fs.existsSync( buildFilePath ) ) {
	var raw = fs.readFileSync( buildFilePath );
	buildFile = yaml.safeLoad( raw );
}

cli
	.version( package.version )
	.usage( "[path]" )
	.option( "-o, --releaseOwner <owner>", "the fork/owner releases get built from" )
	.option( "-b, --releaseBranch <branch>", "the branch releases get built from" )
	.parse( process.argv );

var releaseOwner = cli.releaseOwner;
var releaseBranch = cli.releaseBranch;

function onInfo( info ) {
	var tagFile = path.join( root, ".droneTags.yml" );
	var infoFile = path.join( root, ".buildInfo.yml" );
	var tags = [];
	var fullTag = format( "%s_%s_%s_%s_%d_%s",
		info.owner,
		info.repository,
		info.branch,
		info.version,
		info.build,
		info.slug
	);
	var versionTag = "v" + info.version;
	var release = releaseOwner && 
				releaseBranch && 
				releaseOwner.toLowerCase() === info.owner.toLowerCase() &&
				releaseBranch.toLowerCase() === info.branch.toLowerCase();
	if ( release ) {
		tags.push( "latest" );
		tags.push( versionTag );
		if( buildFile.publish && buildFile.publish.docker ) {
			info.dockerImage = format( "%s:%s", buildFile.publish.docker.repo, versionTag );
		}
	} else {
		tags.push( fullTag );
		if( buildFile.publish && buildFile.publish.docker ) {
			info.dockerImage = format( "%s:%s", buildFile.publish.docker.repo, fullTag );
		}
	}
	var list = { tags: tags };
	fs.writeFile( tagFile, yaml.safeDump( list ), function( err ) {
		if ( err ) {
			console.error( "Failed to write tags to", tagFile );
		} else {
			console.log( tagFile, "written successfully" );
		}
	} );
	fs.writeFile( infoFile, yaml.safeDump( info ), function( err ) {
		if( err ) {
			console.error( "Failed to write build information to", infoFile );
		} else {
			console.log( infoFile, "written successfully" );
		}
	} );
}

function onError( err ) {
	var message = err.error ? err.error.message : err.stack;
	console.error( "Could not get build information due to", message );
}

git.repo( root )
	.then( onInfo, onError );
