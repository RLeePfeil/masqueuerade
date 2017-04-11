// Initialize SC with client id
var client_id = "cef1d0ccdcdb8812196b29aeec920c4a";
SC.initialize({
	client_id: client_id
});

// Initialize angular app
var app = angular.module("masqueuerade", []);

app.controller("MasqueueradeController", function(){
	var _this = this;
	this.searchUser = function(){
		scFuncs.searchUsers(this.userField, function(users){
			_this.users = users;
			
			$('#display-users img').on('load', function(){
				$(this).parent().addClass('loaded');
			})
		});
	}
	return false; // Don't submit form!
});


// Raw SC functions
var scFuncs = {
	searchUsers: function(q, callback) {
		SC.get('/users', {q: q}, function(users) {
			//hideLoading();
			console.log("user data: ", users);
			callback(users);
		});
	},
	
	followingByUserId: function(id, callback) {
		SC.get('/users/'+id+"/followings", function(users) {
			//hideLoading();
			callback(users);
		})
	},
	
	recentTracks: function(id, callback) {
		SC.get('/users/'+id+'/tracks', function(tracks) {
			callback(tracks);
		});
	}
}