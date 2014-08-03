var assert = require( 'chai' ).assert,
	request = require( 'request' ),
	sinon = require( 'sinon' ),
	path = require( 'path' ),
	fs = require('fs'),
	inspect = require('eyes').inspector({maxLength: false}),
	Redside = require( '../redside' );

describe('Redside', function() {
	var benham = new Redside(),
		station = 'beno3';

	it( 'should create an instance of redside', function( done ) {
		assert.instanceOf( new Redside(), Redside, 'benham is an instance of Redside' );
		done();
	} );

	describe( 'fetch', function() {

		before( function(done) {
			var beno3xml = fs.readFileSync( path.resolve( __dirname, 'beno3.xml' ), "utf8" );
			sinon.stub( request, 'get' ).yields( null, null, beno3xml );
			done();
		} );

		after( function( done ) {
			request.get.restore();
			done();
		} );

		it( 'should require options' , function( done ) {
			assert.throws( benham.fetch, 'options object is required' );
			done();
		} );

		it( 'should call the callback', function( done ) {
			benham.fetch( { station: station, callback: function( response ) {
				assert.ok( request.get.called );
				done();
			} } );
		} );

		it( 'should return an array', function( done ) {
			benham.fetch( { station: station, callback: function( response ) {
				assert.isArray( response );
				done();
			} } );
		} );

		it( 'should set proper object values', function( done ) {
			benham.fetch( { station: station, callback: function( response ) {
				var record = response[0];
				assert.strictEqual( record.date, '2014-08-01T05:30:00-00:00' );
				assert.strictEqual( record.stage, '5.12' );
				assert.strictEqual( record.cfs, '1930.00' );
				done();
			} } );
		} );
	} );

} );