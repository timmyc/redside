var request = require('request'),
	async = require( 'async' ),
	_ = require( 'lodash' ),
	parser = require('xml2js').parseString;

/**
 * Configs
 */
var noaaEndpoint = 'http://water.weather.gov/ahps2/hydrograph_to_xml.php?gage=';

function Redside( options ) {
	var options = options || {};

	if ( ! ( this instanceof Redside ) ) {
		return new Redside( options );
	}
	if ( 'string' !== typeof( options.station ) ) {
		throw new TypeError( 'station is a required option' );
	}
	this.station = options.station;
	this.data = [];
	this.response = null;
	return this;
}

Redside.prototype.fetch = function( cb ) {
	var url = noaaEndpoint + this.station,
		_this = this;
	async.waterfall([
		function( callback ) {
			request.get( url, function ( error, response, body ) {
				
				if ( error ) {
					throw new Error( 'Unable to contact NOAA' );
				}

				parser (body, function ( error, result ) {
					callback( null, result );
				} );

			} );
		},
		function( data, callback ) {
			_this.data = data.site.observed[ 0 ].datum.map( function( datum ) {
				return {
					date: datum.valid[ 0 ]._,
					stage: datum.primary[ 0 ]._,
					cfs: datum.secondary[ 0 ]._
				};
			} );
			callback( null, _this.data );
		},
		cb
	]);
};

module.exports = Redside;