require( 'dotenv' ).config();
const express = require( 'express' );
const { ApolloServer } = require( 'apollo-server-express' );
const neo4j = require( 'neo4j-driver' );
const cors = require( 'cors' );
const { makeAugmentedSchema } = require( 'neo4j-graphql-js' );
const typeDefs = require( './graphql-schema' );
const resolvers = require( './resolvers' );
const errorPlugin = require( './error-logging-plugin' );

const app = express();

app.use( cors() );
const DB_HOST = process.env.NODE_ENV === 'production' ? process.env.DB_PROD_HOST : process.env.DB_DEV_HOST;
const DB_PW = process.env.NODE_ENV === 'production' ? process.env.DB_PROD_PW : process.env.DB_DEV_PW;

const URI = `bolt://${ DB_HOST }:${ process.env.DB_PORT }`;
const driver = neo4j.driver(
	URI,
	neo4j.auth.basic( process.env.DB_USER, DB_PW ),
);

const schema = makeAugmentedSchema( { typeDefs, resolvers } );

const server = new ApolloServer( {
	context: { driver },
	schema,
	introspection: process.env.NODE_ENV === 'development',
	playground: process.env.NODE_ENV === 'development',
	plugins: [
		errorPlugin,
	],
	formatError: ( err ) => {
		return {
			message: err.message,
			code: err.extensions.code,
			success: false,
			stack: err.path,
		};
	},
	formatResponse: ( res ) => {
		return res;
	},
} );

const port = process.env.PORT;
const path = process.env.ENDPOINT;

server.applyMiddleware( {
	app,
	path,
} );

const d = new Date();
const version = 2.3;

app.listen( { port, path }, () => {
	console.log( `Server v${ version } started at ${ d } listening on http://localhost:${ port }${ path }` );
} );

async function exitHandler( options ) {
	if ( options.exit ) {
		await driver.close();
	}
}

process.on( 'exit', exitHandler.bind( null, { exit: true } ) );
process.on( 'SIGINT', exitHandler.bind( null, { exit: true } ) );
