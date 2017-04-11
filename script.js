var client_id = "cef1d0ccdcdb8812196b29aeec920c4a";
var tracks = [];
var currentTrack;
var stream;

$(function(){
	// Initialize SC with client id
	SC.initialize({
		client_id: client_id
	});
	
	// Handle user form input
	$('#form-user-search').submit(handleUserSearchSubmit)
	
	// Handle user click
	$('#display-users').on("click", "a", handleUserClick);
});

// User input functions

function queryUsers(q) {
	showLoading();
	searchUsers(q, displayUsers);
}

function chooseUser() {
	
}



// Event handler functions

function handleUserSearchSubmit(event) {
	var user = $('#input-user').val();
	if (user) {
		queryUsers(user);
	} else {
		alert("Input user to search for")
	}
	
	return false;
}

function handleUserClick(event) {
	$user = $(this);
	user_id = $user.data('id');
	if (!user_id) {
		// Something went wrong
		alert('Whoops, user id not found.');
	} else {
		showLoading();
		followingByUserId(user_id, compileStream);
	}
}

function compileStream(following) {
	tracks = []; // Reset tracks
	for (i=0; i<following.length; i++) {
		recentTracks(following[i].id, function(_tracks){
			tracks = tracks.concat(_tracks);
		});
	}
	
	// Need to tell when all recent tracks are done loading, then order them by recent
	// For now just do it after a certain amount of time
	setTimeout(sortTracks, 2000);
	setTimeout(showTracks, 2010);
	setTimeout(playTrack, 2500);
}



// UI functions

function showLoading() {
	$('#loading').show();
}

function hideLoading() {
	$('#loading').hide();
}

// Display data on searched-for users
function displayUsers(users) {
	console.log(users);
	html = "";
	for (i=0; i<users.length; i++) {
		html = html + '<a data-id="'+users[i].id+'"><img src="'+users[i].avatar_url+'" /><span>'+users[i].username+'</span></a>';
	}
	$('#display-users').empty().append(html);
	$('#display-users img').on('load', function(){
		$(this).parent().addClass('loaded');
	})
}

// Sorts the tracks in the tracks array by date - newest to oldest
function sortTracks() {
	function compare(a,b) {
		var date_a = new Date(a.created_at);
		var date_b = new Date(b.created_at);
		
		if (date_a.getTime() > date_b.getTime()) {
			return -1;
		}
		if (date_a.getTime() < date_b.getTime()) {
			return 1;
		}
		return 0;
	}
	
	tracks.sort(compare);
}

// Show widget based on tracks

function showTracks(args) {
	// Hide the users
	$('#display-users').slideUp();
	
	// Only show the first 100 tracks
	var numTracks = tracks.length <= 100 ? tracks.length : 100;
	var html = "";
	
	for (i=0; i<numTracks; i++) {
		html = html + '<a href="#" class="track" data-i="'+i+'" data-id="'+tracks[i].id+'"><img src="'+tracks[i].artwork_url+'" /></a>';
	}
	
	$('#display-tracks').empty().append(html);
	$('#display-tracks img').on('load', function(){
		$(this).parent().addClass('loaded');
	});
	$('#display-tracks a').on('click', function(){
		console.log('clicked track '+$('#display-tracks a').index(this));
		playTrack($('#display-tracks a').index(this));
		return false;
	})
}

function playTrack(which) {
	console.log("which: ",which);
	which = which == undefined ? 0 : which;
	
	if (stream != undefined) {
		stream.stop();
		$('#display-tracks a:eq('+currentTrack+')').removeClass('playing');
	}
	
	// If the track clicked is the same as the currentTrack, don't start playing again
	if (currentTrack != which) {
		currentTrack = which;
		
		SC.stream(tracks[which].uri, {onfinish: nextTrack}, function(sound){
			console.log("playing track "+currentTrack);
			stream = sound;
			sound.play();
			$('#display-tracks a:eq('+currentTrack+')').addClass('playing');
		});
	}
}

function nextTrack() {
	console.log("next track");
	if ($('#display-tracks > a').length < currentTrack ++) {
		playTrack(currentTrack);
	} else {
		// No more tracks to play.
		console.log("no more tracks to play");
	}
}


// Raw SC functions

function searchUsers(q, callback) {
	SC.get('/users', {q: q}, function(users) {
		hideLoading();
		callback(users);
	});
}

function followingByUserId(id, callback) {
	SC.get('/users/'+id+"/followings", function(users) {
		hideLoading();
		callback(users);
	});
}

function recentTracks(id, callback) {
	SC.get('/users/'+id+'/tracks', function(tracks) {
		callback(tracks);
	});
}