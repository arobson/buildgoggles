require( "./setup" );
var path = require( "path" );
var git = require( "../src/git.js" );
var repoPath = path.resolve( "./spec/fauxgitaboudit" );

describe( "Git", function() {
	describe( "when getting basic information", function() {
		var repoInfo;

		before( function( done ) {
			git.repo( repoPath )
				.then( function( info ) {
					repoInfo = info;
					done();
				} );
		} );

		it( "should retrieve necessary repository data from environment", function() {
			repoInfo.owner.should.equal( "anonymous" );
			repoInfo.repository.should.equal( "fauxgitaboudit" );
			repoInfo.branch.should.equal( "master" );
			repoInfo.path.should.equal( repoPath );
			repoInfo.build.should.equal( 5 );
			repoInfo.commit.length.should.equal( 40 );
		} );
	} );

	describe( "when getting branch from drone", function() {
		var repoInfo;

		before( function() {
			process.env.DRONE = true;
			process.env.DRONE_BRANCH = "testing";
			return git.repo( repoPath )
				.then( function( info ) {
					repoInfo = info;
				} );
		} );

		it( "should retrieve expected repository data from environment", function() {
			repoInfo.owner.should.equal( "anonymous" );
			repoInfo.repository.should.equal( "fauxgitaboudit" );
			repoInfo.branch.should.equal( "testing" );
			repoInfo.path.should.equal( path.resolve( repoPath ) );
			repoInfo.build.should.equal( 5 );
			repoInfo.commit.length.should.equal( 40 );
		} );

		after( function() {
			delete process.env.DRONE;
			delete process.env.DRONE_BRANCH;
		} );
	} );
} );
