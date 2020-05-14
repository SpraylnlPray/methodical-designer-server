// Get a key from the return object
function Get( results, key ) {
	if ( results.records[0].keys.includes( key ) ) {
		return results.records[0].get( key ).properties;
	}
	return undefined;
}

// Sets undefined properties to default values
function SetDefaults( obj, defaultObj ) {
	for ( let key of Object.keys( defaultObj ) ) {
		if ( !obj[key] ) {
			obj[key] = defaultObj[key];
		}
	}
	return obj;
}

function PrepareReturn( results, key, defaultObj ) {
	let obj = Get( results, key );
	obj = SetDefaults( obj, defaultObj );
	return obj;
}

// takes objects out of props on to args so we can pass args directly
function TakeKeysFromProps( object, ...keys ) {
	const props = object.props;
	for ( let key of keys ) {
		if ( props[key] ) {
			object[key] = props[key];
			delete object.props[key];
		}
	}
	return object;
}

module.exports = { PrepareReturn, TakeKeysFromProps };