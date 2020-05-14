const seedQuery = require( './seed' );
const neo4j = require( 'neo4j-driver' );
const { defaultNode, defaultLink, defaultSeq, defaultLinkEnd } = require( './defaults' );
const { PrepareReturn, TakeKeysFromProps } = require( './ResolverUtils' );
const defaultRes = { success: true, message: '' };
const errorRes = e => ({ success: false, message: e.message });

const resolvers = {
	Mutation: {
		async SeedDB( _, __, ctx ) {
			const session = ctx.driver.session();
			const deleteQuery = `
				MATCH (n) DETACH DELETE n
			`;
			await session.run( deleteQuery );
			await session.run( seedQuery );
			return {
				success: true,
			};
		},

		async CreateNode( _, args, ctx ) {
			try {
				const session = ctx.driver.session();
				const query = `
					CREATE (n:Node:${ args.type } {id: $id, label: $label, type: $type})
					SET n += $props
					RETURN n`;
				const results = await session.run( query, args );
				return {
					...defaultRes,
					node: PrepareReturn( results, 'n', defaultNode ),
				};
			}
			catch ( e ) {
				return errorRes( e );
			}
		},
		async CreateLink( _, args, ctx ) {
			try {
				const session = ctx.driver.session();
				const query = `
					CREATE (l:Link:${ args.type } {id: $id})
					SET l += {x_id: $x_id, y_id: $y_id, type: $type, label: $label}
					SET l += $props
					WITH l AS l
					MATCH (x:Node) WHERE x.id = $x_id
					CREATE (l)-[:X_NODE]->(x)
					WITH l AS l, x AS x
					MATCH (y:Node) WHERE y.id = $y_id
					CREATE (l)-[:Y_NODE]->(y)
					RETURN l
				`;
				const results = await session.run( query, args );
				return {
					...defaultRes,
					link: PrepareReturn( results, 'l', defaultLink ),
				};
			}
			catch ( e ) {
				return errorRes( e );
			}
		},

		// at the moment not used
		async CreateSequence( _, args, ctx ) {
			try {
				args.props.seq = neo4j.int( args.props.seq );
				const session = ctx.driver.session();
				const query = `
					CREATE (s:Sequence {id: randomUUID()})
					SET s += $props
					WITH s AS s
					MATCH (l:Link) WHERE l.id = $link_id
					CREATE (l)-[:IS]->(s)
					RETURN s, l
				`;
				const results = await session.run( query, args );
				const seq = Get( results, 's' );
				seq.seq = neo4j.integer.toNumber( seq.seq );
				return {
					...defaultRes,
					seq: PrepareReturn( results, 's', defaultSeq ),
					link: PrepareReturn( results, 'l', defaultLink ),
				};
			}
			catch ( e ) {
				return errorRes( e );
			}
		},
		// at the moment not used
		async CreateLinkEnd( _, args, ctx ) {
			try {
				const session = ctx.driver.session();
				args = TakeKeysFromProps( args, 'xy' );
				const query = `
					CREATE (le:LinkEnd {id: randomUUID()})
					SET le += $props
					WITH le AS le
					MATCH (l:Link) WHERE l.id = $link_id
					CREATE (l)-[:${ args.xy.toUpperCase() }_END]->(le)
					RETURN le, l
				`;
				const results = await session.run( query, args );
				return {
					...defaultRes,
					link: PrepareReturn( results, 'l', defaultLink ),
					end: PrepareReturn( results, 'le', defaultLinkEnd ),
				};
			}
			catch ( e ) {
				return {
					message: e.message,
					success: false,
				};
			}
		},

		async UpdateNode( _, args, ctx ) {
			try {
				const session = ctx.driver.session();
				const query = `
					MATCH (n:Node) WHERE n.id = $id
					SET n:Node:${ args.type }
					SET n += $props
					RETURN n
				`;
				const results = await session.run( query, args );
				return {
					...defaultRes,
					node: PrepareReturn( results, 'n', defaultNode ),
				};
			}
			catch ( e ) {
				return errorRes( e );
			}
		},
		async UpdateLink( _, args, ctx ) {
			try {
				const session = ctx.driver.session();
				let query = `
					MATCH (l:Link) WHERE l.id = $id
					SET l += $props
				`;

				if ( args.props.x_id ) {
					query += `
						WITH l AS l
						OPTIONAL MATCH (l)-[r:X_NODE]->(:Node)
						DELETE r
						WITH l AS l
						MATCH (n:Node) WHERE n.id = $props.x_id
						CREATE (l)-[r:X_NODE]->(n)
					`;
				}
				if ( args.props.y_id ) {
					query += `
						WITH l AS l
						OPTIONAL MATCH (l)-[r:Y_NODE]->(:Node)
						DELETE r
						WITH l AS l
						MATCH (n:Node) WHERE n.id = $props.y_id
						CREATE (l)-[r:Y_NODE]->(n)
					`;
				}
				query += `
					RETURN l
				`;
				const results = await session.run( query, args );

				return {
					...defaultRes,
					link: PrepareReturn( results, 'l', defaultLink ),
				};
			}
			catch ( e ) {
				return errorRes( e );
			}
		},

		async MergeSequence( _, args, ctx ) {
			try {
				const session = ctx.driver.session();
				const query = `
					MATCH (l:Link) WHERE l.id = $link_id
					MERGE (l)-[:IS]->(s:Sequence)
					ON CREATE SET s.id = randomUUID(), s += $props
					ON MATCH SET s += $props
					RETURN l, s
				`;

				const results = await session.run( query, args );
				return {
					...defaultRes,
					seq: PrepareReturn( results, 's', defaultSeq ),
					link: PrepareReturn( results, 'l', defaultLinkEnd ),
				};
			}
			catch ( e ) {
				return errorRes( e );
			}
		},
		async MergeLinkEnd( _, args, ctx ) {
			try {
				const session = ctx.driver.session();
				const query = `
					MATCH (l:Link) WHERE l.id = $link_id
					MERGE (l)-[:${ args.props.xy.toUpperCase() }_END]->(le:LinkEnd)
					ON CREATE SET le.id = randomUUID(), le += $props
					ON MATCH SET le += $props
					RETURN le, l
				`;
				const results = await session.run( query, args );
				return {
					...defaultRes,
					end: PrepareReturn( results, 'le', defaultLinkEnd ),
					link: PrepareReturn( results, 'l', defaultLink ),
				};
			}
			catch ( e ) {
				return errorRes( e );
			}
		},

		// at the moment not used
		async UpdateSequence( _, args, ctx ) {
			const session = ctx.driver.session();
			args.props.seq = neo4j.int( args.props.seq );
			const query = `
				MATCH (l:Link) WHERE l.id = $link_id
				MATCH (l)-[:IS]->(s:Sequence)
				SET s += $props
				RETURN l, s
			`;
			const results = await session.run( query, args );
			const seq = Get( results, 's' );
			seq.seq = neo4j.integer.toNumber( seq.seq );
			return {
				success: true,
				link: Get( results, 'l' ),
				seq,
			};
		},
		// at the moment not used
		async UpdateLinkEnd( _, args, ctx ) {
			const session = ctx.driver.session();
			args = TakeKeysFromProps( args, 'xy' );
			const query = `
				MATCH (l:Link) WHERE l.id = $link_id
				MATCH (l)-[:${ args.xy.toUpperCase() }_END]->(le:LinkEnd)
				SET le += $props
				RETURN le, l
			`;
			const results = await session.run( query, args );
			return {
				success: true,
				link: Get( results, 'l' ),
				end: Get( results, 'le' ),
			};
		},

		async DeleteNode( _, args, ctx ) {
			try {
				const session = ctx.driver.session();
				const deleteNodeQuery = `
					MATCH (n:Node) WHERE n.id = $id
					DETACH DELETE n
				`;
				await session.run( deleteNodeQuery, args );

				const cleanupQuery = `
					MATCH (l:Link) WHERE NOT (l)--(:Node)
					OPTIONAL MATCH (l)-[:X_END]-(le:LinkEnd)
					DETACH DELETE le
					WITH l AS l
					OPTIONAL MATCH (l)-[:Y_END]-(le:LinkEnd)
					DETACH DELETE le
					WITH l AS l
					OPTIONAL MATCH (l)-[:IS]-(s:Sequence)
					DETACH DELETE s
					DETACH DELETE l
				`;
				await session.run( cleanupQuery );

				return {
					success: true,
					id: args.id,
				};
			}
			catch ( e ) {
				return errorRes( e );
			}
		},
		async DeleteLink( _, args, ctx ) {
			try {
				const session = ctx.driver.session();
				const query = `
					MATCH (l:Link) WHERE l.id = $id
					OPTIONAL MATCH (l)--(le:LinkEnd)
					DETACH DELETE le
					WITH l AS l
					OPTIONAL MATCH (l)--(s:Sequence)
					DETACH DELETE s
					DETACH DELETE l
				`;
				await session.run( query, args );
				return {
					success: true,
					id: args.id,
				};
			}
			catch ( e ) {
				return errorRes( e );
			}
		},
		async DeleteSequence( _, args, ctx ) {
			try {
				const session = ctx.driver.session();
				const query = `
					MATCH (l:Link) WHERE l.id = $link_id
					OPTIONAL MATCH (l)-[:IS]->(s:Sequence)
					DETACH DELETE s
				`;
				await session.run( query, args );
				return { success: true };
			}
			catch ( e ) {
				return errorRes( e );
			}
		},
		async DeleteLinkEnd( _, args, ctx ) {
			try {
				const session = ctx.driver.session();
				const query = `
					MATCH (l:Link) WHERE l.id = $link_id
					MATCH (l)-[:${ args.xy.toUpperCase() }_END]->(le:LinkEnd)
					DETACH DELETE le
				`;
				await session.run( query, args );
				return { success: true };
			}
			catch ( e ) {
				errorRes( e );
			}
		},
	},
};

module.exports = resolvers;