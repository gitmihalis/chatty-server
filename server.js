// Server
const express = require('express')
const SockectServer = require('ws').Server

// Universal unique identifiers for messages
const uuid = require('node-uuid')

// Set the port to 3001
const PORT = 3001

// Create a new express server
const server = express()
   // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`))
// Create a web sockets server
const wss = new SockectServer({ server })

// TODO Currently connected clients
const CLIENTS = {}
// A callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.
wss.on('connection', (client) => {

  const cId = uuid()

	clientConnected(CLIENTS, cId)
	//  A callback for when a client closes the socket. This usually means they closed their browser.
  client.on('close', () => clientDisconnected(CLIENTS, cId) )

  client.on('message', (incoming) => {
 	  console.log('incoming message: ', incoming)

 		const data = JSON.parse(incoming)

 		switch(data.type) {
 			case "postMessage":
 				data.id = uuid()
 				data.type = 'incomingMessage'
 				wss.broadcast(JSON.stringify(data))
 				break
 			case "postNotification":
 				data.id = uuid()
 				data.type = 'incomingNotification'
 				wss.broadcast(JSON.stringify(data))
 				break
 			default:
 				console.error('Unkown data type ', data.type)
 		}
 	})
})
// Broadcast - Goes through each client and sends message data
wss.broadcast = function(data) {
  wss.clients.forEach(function(client) {
    if (client.readyState === client.OPEN) {
      client.send(data)
    }
  })
}
// A client is added to clients on a connection event
function clientConnected(clients, clientId) {
  clients[clientId] = {
    id: clientId
  }
  // Convert clients object to Array before sending to React app
  let clientsArr = Object.keys(clients).map( (key) => clients[key] )
  // Setup message to be set to the client
  // Includes all currently connected clients
  const connectionMsg = {
    type: 'connectionNotification',
    id: uuid(),
    clients: clientsArr,
  }
  console.log('[^^ clientsArr] ', clientsArr)
  wss.broadcast(JSON.stringify(connectionMsg))
  console.log(`>> client connected`)
}

// Disconnection event
function clientDisconnected(clients, clientId) {
  const client = clients[clientId]
  if (!client) {
    return
  }
  delete clients[clientId]

  // convert CLIENTS object to array before sending to React app
  let clientsArr = Object.keys(clients).map( (key) => clients[key] )

	const disconnectionMsg = {
		type: 'disconnectNotification',
		id: uuid(),
		clients: clientsArr,
	}
  console.log('[^^ clientsArr] ', clientsArr)
  wss.broadcast(JSON.stringify(disconnectionMsg))
  console.log(`<< client disconnected`)
}


