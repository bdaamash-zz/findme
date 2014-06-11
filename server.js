/*************************************
//
// spot-me app
//
**************************************/

// express magic
var express = require('express');
var app = express();
var server = require('http').createServer(app)
var io = require('socket.io').listen(server);
var device  = require('express-device');

var runningPortNumber = process.env.PORT;


app.configure(function(){
	// I need to access everything in '/public' directly
	app.use(express.static(__dirname + '/public'));

	//set the view engine
	app.set('view engine', 'ejs');
	app.set('views', __dirname +'/views');

	app.use(device.capture());
});


// logs every request
app.use(function(req, res, next){
	// output every request in the array
	console.log({method:req.method, url: req.url, device: req.device});

	// goes onto the next function in line
	next();
});

app.get("/", function(req, res){
	res.render('index', {});
});

app.get("/client", function(req, res){
	res.render('client', {});
});

var connectedUsers = {};
var counter = 0;
io.sockets.on('connection', function (socket) {

    ++counter;
	socket.on('join', function(user) {
	    socket.key = Date.now();
        connectedUsers[socket.key] = user;
        console.log(user);
        socket.broadcast.emit('online users', {
            counter: counter,
        });

	});


	socket.on("send location", function(data) {
              var current_user = connectedUsers[socket.key];
              console.log('current user: '+ socket.key);
              if(current_user) {
                data.lat = current_user.lat;
                data.lng = current_user.lng;
                data.key = socket.key;
                socket.broadcast.emit("location update", data);
              }
  	});

	socket.on("request locations", function(sendData) {
    	sendData(connectedUsers);
  	});

  	socket.on('disconnect', function(data) {
	      var userInfo = connectedUsers[socket.key];
	      if(userInfo) {
	        delete connectedUsers[socket.key];        
            --counter;
            socket.broadcast.emit('user disconnected', {
                key: socket.key,
            });
            
            socket.broadcast.emit('online users', {
                counter: counter,
            });
	      }
	  });


});


server.listen(runningPortNumber);

