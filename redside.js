var request = require('request'),
	async = require( 'async' ),
	_ = require( 'lodash' ),
	parser = require('xml2js').parseString;

/**
 * Configs
 */
var noaaEndpoint = 'http://water.weather.gov/ahps2/hydrograph_to_xml.php?gage=';

function Redside( options ) {
	if ( ! ( this instanceof Redside ) ) {
		return new Redside( options );
	}
	return this;
}

Redside.prototype.fetch = function( options ) {
	if ( 'object' !== typeof( options ) ) {
		throw new TypeError( 'options object is required' );
	}
	if ( 'string' !== typeof( options.station ) ) {
		throw new TypeError( 'station is a required option' );
	}
	var station = options.station,
		cb = options.callback,
		url = noaaEndpoint + station,
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