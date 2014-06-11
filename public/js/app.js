/*************************************
//
// spot-me app
//
**************************************/

// connect to our socket server
var socket = io.connect('http://127.0.0.1:3000/');

var app = app || {};


// shortcut for document.ready
$(function(){

    var $sendBlastButton = $('#send');
	
    if (typeof google === 'object' && typeof google.maps === 'object'){
        //setup some common vars
        var $mapCanvas = $("#mapCanvas");
        var infowindow = new google.maps.InfoWindow({});
        //$mapCanvas.width(800);
        //$mapCanvas.height(600);
        var userMarker, map;
        var markers = {};
        var defaultPosition = new google.maps.LatLng(39.833333, -98.583333);
        var mapOptions = {
                zoom: 4,
                center: defaultPosition,
                mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        map = new google.maps.Map(document.getElementById("mapCanvas"), mapOptions);
        socket.on('location update', updateUserMarker);
        socket.on('user disconnected', removeMarker);
        //socket.emit('request locations', loadMarkers);

        function getMarker(lat, lng, label){
            return new google.maps.Marker({
                    title: label,
                    map: map,
                    position: new google.maps.LatLng(lat,lng),
                });

        }

    }

	function updateUserMarker(data) {
        console.log(data);
		userMarker = getMarker(data.lat, data.lng, data.username);
        markers[data.key]=userMarker;
		map.setCenter(markers[data.key].getPosition());
        var contentString = '<b>Username: </b>'+data.username;
        
        google.maps.event.addListener(userMarker, 'click', function() {
                infowindow.setContent(contentString);
                infowindow.open(map,markers[data.key]);
        });
	}

    function removeMarker(data) {
        markers[data.key].setMap(null);
        delete markers[data.key];
    }

	$sendBlastButton.click(function(e){
        
		if(navigator.geolocation){

			navigator.geolocation.getCurrentPosition(showPosition);
		}
	});	
    
    $('#locate_newyork').click(function(e){
        var username = $('.username').val();
        if(username == ''){
            alert('username can not be empty');
            return;
        }
        var data = {
            lat:40.7056308,
            lng:-73.9780035,
            username: username
        }
        
        socket.emit('join',data);
        socket.emit("send location",data);
    });

    function showPosition (position){
        var username = $('.username').val();
        if(username == ''){
            alert('username can not be empty');
            return;
        }
        var data = {
            lat : position.coords.latitude,
            lng : position.coords.longitude,
            username: username,
          }
        
        socket.emit('join',data);
        socket.emit("send location",data);
        
        
    }
    
    socket.on('online users', function(data) {
        $('.user_counter').html(data.counter);
    });
});
