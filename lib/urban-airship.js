var https = require("https");

/*
 * Node-urban-airship is a simple wrapper for the Urban Airship API.
 *
 *      _..--=--..._
 *   .-'            '-.  .-.
 *  /.'              '.\/  /
 * |=-                -=| (
 *  \'.              .'/\  \
 *   '-.,_____ _____.-'  '-'
 * jgs    [_____]=8
 *
 * @params
 *	key - Your API key
 *	secret - Your secret key
 */
var UrbanAirship = module.exports = function(key, secret, master) {
	this._key = key;
	this._secret = secret;
	this._master = master;
}

/*
 * Push a notification to a registered device.
 *
 * @params
 *	device_ids - String or array of awesome device ids.
 *	alert - The message to send
 *	badge - The badge number (opt.)
 *  sound - name of a sound fiel bundled LK
 *  custom_field LK
 * custom_value LK
 *	callback
 */
UrbanAirship.prototype.pushNotification = function(device_ids, alert, badge, sound, url, callback) {
	this._auth = new Buffer(this._key + ":" + this._master, "utf8").toString("base64");
		
	if (badge instanceof Function) {
		callback = badge;
		badge = 0;
	}
	
	if (typeof device_ids === "string") {
		// We can assume only one device id was sent?
		device_ids = [device_ids];
	}
	
	var payload = {
		"device_tokens": device_ids,
		"aps": {
			"alert": alert
		},
		"url": url
	}
	if (badge != null)
		payload.aps.badge = badge;
	if (sound != null)
		payload.aps.sound = sound;
	
	console.log(payload);
	this._transport("/api/push/", "POST", payload, callback);
}

/*
 * Register a new device.
 *
 * @params
 *	device_id - The device identifier
 *	data - The JSON payload (optional)
 *	callback
 */
UrbanAirship.prototype.registerDevice = function(device_id, data, callback) {
	this._auth = new Buffer(this._key + ":" + this._secret, "utf8").toString("base64");
		
	var path = "/api/device_tokens/" + device_id;
	
	if (data) {
		// Registration with optional data
		this._transport(path, "PUT", data, callback);
	}
	else {
		// Simple registration with no additional data
		this._transport(path, "PUT", callback);
	}
}

/*
 * Unregister a device.
 *
 * @params
 *	device_id - The device identifier
 *	callback
 */
UrbanAirship.prototype.unregisterDevice = function(device_id, callback) {
	this._auth = new Buffer(this._key + ":" + this._secret, "utf8").toString("base64");
	this._transport("/api/device_tokens/" + device_id, "DELETE", callback);
}

/*
 * Send things to UA!
 *
 * @params
 *	path - API route
 *	method - The HTTPS method to employ
 *	request_data - The JSON data we are sending (optional)
 *	callback
 */
UrbanAirship.prototype._transport = function(path, method, request_data, callback) {
	var self = this,
		rd = "",
		response_data = "",
		https_opts = {
			"host": "go.urbanairship.com",
			"port": 443,
			"path": path,
			"method": method,
			"headers": {
				"Authorization": "Basic " + this._auth
			}
		};
	
	// We don't necessarily send data
	if (request_data instanceof Function) {
		callback = request_data;
		request_data = null;
	}
	
	// Set a Content-Type and Content-Length header if we are sending data
	if (request_data) {
		rd = JSON.stringify(request_data);
		
		https_opts.headers["Content-Type"] = "application/json";
		https_opts.headers["Content-Length"] = Buffer.byteLength(rd, "utf8");
	}
	else {
		https_opts.headers["Content-Length"] = 0;
	}
	
	var request = https.request(https_opts, function(response) {
		response.setEncoding("utf8");
		
		response.on("data", function(chunk) {
			response_data += chunk;
		});
		
		response.on("end", function() {
			// Success on 200 or 204
			if (response.statusCode === 200 || response.statusCode === 204) {
				callback();
			}
			else {
				callback(new Error(response_data));
			}
		});
		
		response.on("error", function(error) {
			callback(error);
		});
	});
	
	request.on("error", function(error) {
		callback(error);
	});
	
	if (request_data) {
		request.write(rd);
	}
	
	request.end();
}