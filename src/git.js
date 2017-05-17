var when = require( "when" );
var exec = require( "./command" );
var versions = require( "./version" );
var fs = require( "fs" );
var syspath = require( "path" );
var format = require( "util" ).format;

function createInfo( path, branch, build, commit, owner, repo, format ) {
	var verionParts = build.version ? build.version.split(".") : [ "0", "0", "0" ];
	var major = verionParts[ 0 ];
	var minor = verionParts.length > 1 ? verionParts[ 1 ] : "0";
	var patch = verionParts.length > 2 ? verionParts[ 2 ] : "0";
	var tag = getTags( branch, build, commit, owner, repo, major, minor, patch, format );
	return {
		branch: branch,
		version: build.version,
		build: build.count,
		commit: commit,
		owner: owner,
		path: syspath.resolve( path ),
		repository: repo,
		major: major,
		minor: minor,
		patch: patch,
		major_version: major,
		minor_version: [ major, minor ].join( "." ),
		tag: tag,
		slug: commit.slice( 0, 8 )
	};
}

function filter( list ) {
	if( !list ) {
		return [];
	} else {
		return list.reduce( function( acc, x ) {
			if( x ) {
				acc.push( x );
			}
			return acc;
		}, [] );
	}
}

function getBranch( path ) {
	if ( process.env.DRONE ) {
		return when.resolve( process.env.DRONE_BRANCH );
  } else if( process.env.TRAVIS ) {
    return when.resolve( process.env.TRAVIS_BRANCH );
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
				return {
					version: version,
					count: filter( list.split( "\n" ) ).length + 1
				};
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
				return {
					version: version,
					count: 0
				};
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
					var items = filter( list.split( "\n" ) );
					return getLast( items ).split( "|" );
				} else {
					return 0;
				}
			},
			function() {
				return "none";
			} );
}

function getLast( list ) {
	if( !list || list.length === 0 ) {
		return undefined;
	}
	return list[ list.length - 1 ];
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
			} )
		.then( function( owner ) {
			if ( owner === "anonymous" ) {
        if( process.env.DRONE ) {
          owner = process.env.DRONE_REPO_OWNER || process.env.DRONE_REPO_SLUG.split( "/" )[ 1 ];
        } else if( process.env.TRAVIS ) {
          owner = process.env.TRAVIS_REPO_SLUG.split( "/" )[ 0 ];
        }
				return owner;
			} else {
				return owner;
			}
		} );
}

function getRepository( path ) {
	var regex = /(https:\/\/|git@|git:\/\/)[^:\/]*[:\/][^\/]*\/(.*)/;
	var dirname = syspath.basename( syspath.resolve( path ) );
  if( process.env.DRONE ) {
    return when.resolve( process.env.DRONE_REPO_NAME || process.env.DRONE_REPO_SLUG.split( "/" )[ 2 ] );
  } else if( process.env.TRAVIS ) {
    return when.resolve( repo = process.env.TRAVIS_REPO_SLUG.split( "/" )[ 1 ] );
  } else {
  	return exec( "git remote show origin -n | grep 'Fetch URL: .*'", path )
  		.then(
  			function( line ) {
  				return regex.test( line ) ? regex.exec( line )[ 2 ] : dirname;
  			},
  			function() {
          return dirname;
  			} );
  }
}

function getSlug( path ) {
	return getCommit( path )
		.then( function( sha ) {
			return sha.slice( 0, 8 );
		} );
}

function getTags( branch, build, commit, owner, repo, major, minor, patch, format ) {
	var specs = format.split( "," );
	var tags = specs.reduce( function( acc, spec ) {
		var segments = spec.split( "_" ).reduce( function( t, abbr ) {
			switch ( abbr ) {
				case "o":
					t.push( owner );
					break;
				case "r":
					t.push( repo );
					break;
				case "b":
					t.push( branch );
					break;
				case "v":
					t.push( build.version );
					break;
				case "c":
					t.push( build.count );
					break;
				case "s":
					t.push( commit.slice( 0, 8 ) );
					break;
				case "ma":
					t.push( major );
					break;
				case "mi":
					t.push( minor );
					break;
				case "p":
					t.push( patch );
					break;
				case "miv":
					t.push( [ major, minor ].join( "." ) );
					break;
			}
			return t;
		}, [] );
		acc.push( segments.join( "_" ) );
		return acc;
	}, [] );
	return tags.length === 1 ? tags[ 0 ] : tags;
}

function readRepository( path, format ) {
	var fullPath = syspath.resolve( path );
	if ( fs.existsSync( fullPath ) ) {
		return when.try( createInfo, path, getBranch( path ), getBuildNumber( path ), getCommit( path ), getOwner( path ), getRepository( path ), format );
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
