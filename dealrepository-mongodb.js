var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

DealRepository = function(host, port) {
  this.db= new Db('node-mongo-deals', new Server(host, port, {auto_reconnect: true}, {}));
  this.db.open(function(){});
};

//getCollection

DealRepository.prototype.getCollection= function(callback) {
  this.db.collection('deals', function(error, deal_collection) {
    if( error ) callback(error);
    else callback(null, deal_collection);
  });
};

//findAll
DealRepository.prototype.findAll = function(callback) {
    this.getCollection(function(error, deal_collection) {
      if( error ) callback(error)
      else {
        deal_collection.find().toArray(function(error, results) {
          if( error ) callback(error)
          else callback(null, results)
        });
      }
    });
};

//findById
DealRepository.prototype.findById = function(id, callback) {
    this.getCollection(function(error, deal_collection) {
      if( error ) callback(error)
      else {
        deal_collection.findOne({_id: deal_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
          if( error ) callback(error)
          else callback(null, result)
        });
      }
    });
};

//save
DealRepository.prototype.save = function(deals, callback) {
    this.getCollection(function(error, deal_collection) {
      if (error) callback(error)
      else {
        if (!(deals instanceof Array) ) deals = [deals];

        for(var i = 0;i< deals.length;i++ ) {
          deals[i].created_at = new Date();
          deals[i].openInfos = [];
        }

        deal_collection.insert(deals, function() {
          callback(null, deals);
        });
      }
    });
};

// Add information about a consumer opening a deal on a device
DealRepository.prototype.addOpenInfoToDeal = function(dealId, openInfo, callback) {
  this.getCollection(function(error, deal_collection) {
    if( error ) callback( error );
    else {
      deal_collection.update(
        {_id: deal_collection.db.bson_serializer.ObjectID.createFromHexString(dealId)},
        {"$push": {openInfos: openInfo}},
        function(error, deal){
          if( error ) callback(error);
          else callback(null, deal)
        });
    }
  });
};

exports.DealRepository = DealRepository;
