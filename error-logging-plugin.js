const plugin = {
	requestDidStart() {
		return {
			didEncounterErrors( requestContext ) {
				let msg = requestContext.errors.map( error => ({
					message: error.message,
					location: error.locations[0],
					path: error.path,
				}) );
				console.log( 'Error:', msg );
			},
		};
	},

};

module.exports = plugin;