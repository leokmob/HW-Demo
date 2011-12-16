TokenRepository = function() {};

TokenRepository.prototype.memoryData = [];

//findAll
TokenRepository.prototype.findAll = function(callback) {
	var errors = null;
	callback(errors, this.memoryData);
};

//removeAll
TokenRepository.prototype.removeAll = function(callback) {
	this.memoryData = [];
	var errors = null;
	callback(errors, this.memoryData);
};

//save
TokenRepository.prototype.save = function(token, callback) {
	if (typeof token === "undefined") callback(null, this.memoryData);
	else {
		var i, found = false;
		for( i = 0; i < this.memoryData.length; i++)
			if (this.memoryData[i] == token)
				found = true;
		if (!found)
			this.memoryData.push(token);
		var errors = null;
		callback(errors, this.memoryData);
	}
};

exports.TokenRepository = TokenRepository;
