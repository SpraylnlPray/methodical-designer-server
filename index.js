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

const URI = `bolt://${ process.env.DB_HOST }:${ process.env.DB_PORT }`;
const driver = neo4j.driver(
	URI,
	neo4j.auth.basic( process.env.DB_USER, process.env.DB_PW ),
);

const schema = makeAugmentedSchema( { typeDefs, resolvers } );

const server = new ApolloServer( {
	context: { driver },
	schema,
	introspection: true,
	playground: true,
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
} );

const port = process.env.PORT;
const path = process.env.ENDPOINT;

server.applyMiddleware( { app, path } );

app.listen( { port, path }, () => {
	console.log( `Server listening at http://localhost:${ port }${ path }` );
} );

