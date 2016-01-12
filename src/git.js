var _ = require( "lodash" );
var when = require( "when" );
var exec = require( "./command" );
var versions = require( "./version" );
var fs = require( "fs" );
var syspath = require( "path" );
var format = require( "util" ).format;

function createInfo( path, branch, build, commit, owner, repo ) {
	return {
		branch: branch,
		version: build.version,
		build: build.count,
		commit: commit,
		owner: owner,
		path: syspath.resolve( path ),
		repository: repo,
		slug: commit.slice( 0, 8 )
	};
}

function getBranch( path ) {
	if ( process.env.DRONE ) {
		return when.resolve( process.env.DRONE_BRANCH );
	} else {
		return exec( "git rev-parse --abbrev-ref HEAD", path )
			.then(
				function( branch ) {
					return branch.trim();
				},
				function() {
					return "master";
				}
			);
	}
}

function getBuildNumber( path ) {
	return versions.getFile( path )
		.then( function( file ) {
			return getCommitsSinceCurrentVersion( path, file );
		} );
}

function getCommit( path ) {
	return exec( "git rev-parse HEAD", path )
		.then(
			function( commit ) {
				return commit.trim();
			},
			function() {
				return "none";
			}
		);
}

function getCommitCount( path, version, sha, time ) {
	var command = format( "git log --since=%s %s..HEAD --pretty=%H", time, sha );
	return exec( command, path )
		.then(
			function( list ) {
				return { version: version, count: _.filter( list.split( "\n" ) ).length + 1 };
			},
			function( error ) {
				return 0;
			} );
}

function getCommitsSinceCurrentVersion( path, filePath ) {
	var currentVersion = getCurrentVersion( path, filePath );
	return getCommitsSinceVersion( path, filePath, currentVersion );
}

function getCommitsSinceVersion( path, filePath, version ) {
	var fullPath = syspath.resolve( path, filePath );
	return getFirstCommitForVersion( path, filePath, version )
		.then( function( firstCommitAndDate ) {
			if ( firstCommitAndDate ) {
				return getCommitCount( path, version, firstCommitAndDate[0], firstCommitAndDate[1] );
			} else {
				return { version: version, count: 0 };
			}
		} );
}

function getCurrentVersion( path, filePath ) {
	if ( filePath ) {
		var relativePath = syspath.resolve( path, filePath );
		var fileContent = fs.readFileSync( relativePath ).toString();
		return versions.getVersion( filePath, fileContent );
	} else {
		return versions.getFile( path )
			.then( function( filePath ) {
				return getCurrentVersion( path, filePath );
			} );
	}
}

function getFirstCommitForVersion( path, filePath, version ) {
	var regex = versions.getTemplate( filePath, version );
	var command = format( "git log -S'%s' --pickaxe-regex --pretty='%H|%ct' %s", regex, filePath );
	return exec( command, path )
		.then(
			function( list ) {
				if ( list ) {
					return _.last( _.filter( list.split( "\n" ) ) ).split( "|" );
				} else {
					return 0;
				}
			},
			function() {
				return "none";
			} );
}

function getOwner( path ) {
	var regex = /(https:\/\/|git@|git:\/\/)[^:\/]*[:\/]([^\/]*).*/;
	return exec( "git remote show origin -n | grep 'Fetch URL: .*'", path )
		.then(
			function( line ) {
				return regex.test( line ) ? regex.exec( line )[ 2 ] : "anonymous";
			},
			function( err ) {
				return "anonymous";
			} );
}

function getRepository( path ) {
	var regex = /(https:\/\/|git@|git:\/\/)[^:\/]*[:\/][^\/]*\/(.*)/;
	var dirname = syspath.basename( syspath.resolve( path ) );
	return exec( "git remote show origin -n | grep 'Fetch URL: .*'", path )
		.then(
			function( line ) {
				return regex.test( line ) ? regex.exec( line )[ 2 ] : dirname;
			},
			function() {
				return dirname;
			} );
}

function getSlug( path ) {
	return getCommit( path )
		.then( function( sha ) {
			return sha.slice( 0, 8 );
		} );
}

function readRepository( path ) {
	var fullPath = syspath.resolve( path );
	if ( fs.existsSync( fullPath ) ) {
		return when.try( createInfo, path, getBranch( path ), getBuildNumber( path ), getCommit( path ), getOwner( path ), getRepository( path ) );
	} else {
		return when.reject( new Error( "Cannot load repository information for invalid path \"" + fullPath + '"' ) );
	}
}

module.exports = {
	getBranch: getBranch,
	getBuildNumber: getBuildNumber,
	getCommit: getCommit,
	getCommitCount: getCommitCount,
	getCommitsSinceVersion: getCommitsSinceVersion,
	getCommitsSinceCurrentVersion: getCommitsSinceCurrentVersion,
	getCurrentVersion: getCurrentVersion,
	getFirstCommitForVersion: getFirstCommitForVersion,
	getOwner: getOwner,
	getRepository: getRepository,
	getSlug: getSlug,
	repo: readRepository
};
