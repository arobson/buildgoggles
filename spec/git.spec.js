require( "./setup" );
var path = require( "path" );
var git = require( "../src/git.js" );
var repoPath = path.resolve( "./spec/fauxgitaboudit" );

describe( "Git", function() {
  var owner;

  before( function() {
    owner = "anonymous";
    repo = "fauxgitaboudit";
    if( process.env.TRAVIS ) {
      owner = process.env.TRAVIS_REPO_SLUG.split( "/" )[ 0 ];
      repo = process.env.TRAVIS_REPO_SLUG.split( "/" )[ 1 ];
    }
  } );

	describe( "when getting basic information with default tag", function() {
		var repoInfo;

		before( function( done ) {
			git.repo( repoPath, "o_r_b_v_c_s" )
				.then( function( info ) {
					repoInfo = info;
					done();
				} );
		} );

		it( "should retrieve necessary repository data from environment", function() {
			repoInfo.owner.should.equal( owner );
			repoInfo.repository.should.equal( repo );
			repoInfo.branch.should.equal( "master" );
			repoInfo.path.should.equal( repoPath );
			repoInfo.build.should.equal( 5 );
			repoInfo.commit.length.should.equal( 40 );
			repoInfo.major.should.equal( "0" );
			repoInfo.minor.should.equal( "1" );
			repoInfo.patch.should.equal( "1" );
			repoInfo.major_version.should.equal( "0" );
			repoInfo.minor_version.should.equal( "0.1" );
			repoInfo.tag.should.equal( owner + "_" + repo + "_master_" + repoInfo.version + "_5_" + repoInfo.commit.slice( 0, 8 ) );
		} );
	} );

	describe( "when getting basic information with multiple tags", function() {
		var repoInfo;

		before( function( done ) {
			git.repo( repoPath, [ "v_c_s", "miv", "ma" ] )
				.then( function( info ) {
					repoInfo = info;
					done();
				} );
		} );

		it( "should retrieve necessary repository data from environment", function() {
			repoInfo.owner.should.equal( owner );
			repoInfo.repository.should.equal( repo );
			repoInfo.branch.should.equal( "master" );
			repoInfo.path.should.equal( repoPath );
			repoInfo.build.should.equal( 5 );
			repoInfo.commit.length.should.equal( 40 );
			repoInfo.major.should.equal( "0" );
			repoInfo.minor.should.equal( "1" );
			repoInfo.patch.should.equal( "1" );
			repoInfo.major_version.should.equal( "0" );
			repoInfo.minor_version.should.equal( "0.1" );
			repoInfo.tag.should.eql( [
				repoInfo.version + "_5_" + repoInfo.commit.slice( 0, 8 ),
				"0.1",
				"0"
			] );
		} );
	} );

	describe( "when getting build details from Drone", function() {
		var repoInfo;

		before( function() {
			process.env.DRONE = true;
			process.env.DRONE_BRANCH = "testing";
      process.env.DRONE_REPO_OWNER = "me";
      process.env.DRONE_REPO_NAME = "test";
			return git.repo( repoPath, "o_r_b_v_c_s" )
				.then( function( info ) {
					repoInfo = info;
				} );
		} );

		it( "should retrieve expected repository data from environment", function() {
			repoInfo.owner.should.equal( "me" );
			repoInfo.repository.should.equal( "test" );
			repoInfo.branch.should.equal( "testing" );
			repoInfo.path.should.equal( path.resolve( repoPath ) );
			repoInfo.build.should.equal( 5 );
			repoInfo.commit.length.should.equal( 40 );
		} );

		after( function() {
			delete process.env.DRONE;
      delete process.env.DRONE_BRANCH;
      delete process.env.DRONE_REPO_OWNER;
			delete process.env.DRONE_REPO_NAME;
		} );
	} );

  describe( "when getting build details from Travis", function() {
    var repoInfo;

    before( function() {
      process.env.TRAVIS = true;
      process.env.TRAVIS_BRANCH = "testing";
      process.env.TRAVIS_REPO_SLUG = "me/test";
      return git.repo( repoPath, "o_r_b_v_c_s" )
        .then( function( info ) {
          repoInfo = info;
        } );
    } );

    it( "should retrieve expected repository data from environment", function() {
      repoInfo.owner.should.equal( "me" );
      repoInfo.repository.should.equal( "test" );
      repoInfo.branch.should.equal( "testing" );
      repoInfo.path.should.equal( path.resolve( repoPath ) );
      repoInfo.build.should.equal( 5 );
      repoInfo.commit.length.should.equal( 40 );
    } );

    after( function() {
      delete process.env.TRAVIS;
      delete process.env.TRAVIS_BRANCH;
      delete process.env.TRAVIS_REPO_SLUG;
    } );
  } );
} );
