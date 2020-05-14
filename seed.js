const query = `
	CREATE (ui:Node:AbstractUserInterface {id: randomUUID(), label: "UI", story: "Interaction point for the user", type: "AbstractUserInterface", synchronous: false, unreliable: false})
	CREATE (api:Node:API {id: randomUUID(), label: "Server", story: "Endpoint for requests, fetches and mutates data from/on the DB", type: "API", synchronous: false, unreliable: false})
	CREATE (pers:Node:Persistence {id: randomUUID(), label: "NeoDB", story: "Saves data for the methodical designer", type: "Persistence", synchronous: false, unreliable: true})
	CREATE (event:Node:Event {id: randomUUID(), label: "Create Node", story: "Event for creating a node", type: "Event", synchronous: false, unreliable: true})
		
	CREATE (l_Mutate_UI:Link:Mutate {id: randomUUID(), x_id: api.id, y_id: ui.id, label: "Mutates", story: "Populates the UI with data", type: "Mutate"})
	CREATE (ui)<-[:Y_NODE]-(l_Mutate_UI)-[:X_NODE]->(api)
	
	CREATE (l_Trigger_Event:Link:Trigger {id: randomUUID(), x_id: ui.id, y_id: event.id, label: "Triggers", story: "Dispatch mutation call to the API", type: "Trigger"})
	CREATE (ui)<-[:X_NODE]-(l_Trigger_Event)-[:Y_NODE]->(event)
	
	CREATE (s1:Sequence {id: randomUUID(), group: "Sequence Group", label: "Test Sequence", seq: 1})
	CREATE (l_Trigger_Event)-[:IS]->(s1)
	
	CREATE (le_X_UI_Event:LinkEnd {id: randomUUID(), note: "A note on the X end of the Trigger link", arrow: "default"})
	CREATE (l_Trigger_Event)-[:X_END]->(le_X_UI_Event)
	
	CREATE (le_Y_UI_Event:LinkEnd {id: randomUUID(), note: "A note on the Y end of the Trigger link", arrow: "default"})
	CREATE (l_Trigger_Event)-[:Y_END]->(le_Y_UI_Event)
	
	CREATE (l_Trigger_Server:Link:Trigger {id: randomUUID(), x_id: event.id, y_id: api.id, label: "Triggers", story: "Invoke mutation function to alter data in the DB", type: "Trigger"})
	CREATE (event)<-[:X_NODE]-(l_Trigger_Server)-[:Y_NODE]->(api)
	
	CREATE (le_API_Event:LinkEnd {id: randomUUID(), note: "A note on the X end of the Trigger link", arrow: "default"})
	CREATE (l_Trigger_Server)-[:X_END]->(le_API_Event)
	
	CREATE (l_Mutate_DB:Link:Mutate {id: randomUUID(), x_id: api.id, y_id: pers.id, label: "Mutates", story: "Mutates the data in the DB upon an event from the UI", type: "Mutate"})
	CREATE (api)<-[:X_NODE]-(l_Mutate_DB)-[:Y_NODE]->(pers)
	
	CREATE (le_Pers_API:LinkEnd {id: randomUUID(), note: "A note on the X end of the Trigger link", arrow: "default"})
	CREATE (l_Mutate_DB)-[:X_END]->(le_Pers_API)
	
	CREATE (s2:Sequence {id: randomUUID(), group: "Sequence Group", label: "Test Sequence", seq: 1})
	CREATE (l_Mutate_DB)-[:IS]->(s2)
	
	CREATE (l_Read_DB:Link:Read {id: randomUUID(), x_id: api.id, y_id: pers.id, label: "Read", story: "Fetches data from the DB", type: "Read"})
	CREATE (api)<-[:X_NODE]-(l_Read_DB)-[:Y_NODE]->(pers)
`;

module.exports = query;