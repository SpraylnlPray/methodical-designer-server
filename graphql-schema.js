const fs = require( 'fs' );
const path = require( 'path' );
const schema = './schemas/schema.graphql';
const encoding = 'utf-8';

let typeDefs = '';
typeDefs += fs.readFileSync( path.join( __dirname, schema ) )
	.toString( encoding );

module.exports = typeDefs;