// Server
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
	// Set up a callback that will run when a client connects to the server
	// When a client connects they are assigned a socket, represented by
	// the ws parameter in the callback.
wss.on('connection', (client) => {
	console.log('Client connected')
		 // Set up a callback for when a client closes the socket. This usually means they closed their browser.
 client.on('close', () => console.log('Client disconnected'))

 client.on('message', (incoming) => {
 	const msg = JSON.parse(incoming)
 	msg.id = uuid()
 	wss.broadcast(JSON.stringify(msg))
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
// Handle incoming message
function handleIncomingMessage(data, client) {
	console.log(data)
	let d = JSON.parse(data)
  const message = {
  	id: uuid(),
  	content: d.content,
  	username: d.username
  }
  // Send the msg object as a JSON-formatted string.
  client.send(JSON.stringify(message))
}


