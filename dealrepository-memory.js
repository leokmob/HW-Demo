var dealCounter = 1;

DealRepository = function(host, port){};

DealRepository.prototype.dummyData = [];

DealRepository.prototype.findAll = function(callback) {
  callback( null, this.dummyData )
};

DealRepository.prototype.findById = function(id, callback) {
  var result = null;
  for(var i = 0; i < this.dummyData.length && result == null; i++)
    if( this.dummyData[i]._id.value == id )
      result = this.dummyData[i];
  callback(null, result);
};

DealRepository.prototype.save = function(deals, callback) {
  if( !(deals instanceof Array) ) deals = [deals];
  for( var i = 0; i < deals.length; i++ ) {
    deals[i]._id = {};
	deals[i]._id.value = dealCounter++;
	deals[i]._id.toHexString = function () { return this.value; }
    deals[i].created_at = new Date();
	deals[i].openInfos = [];
    this.dummyData[this.dummyData.length] = deals[i];
  }
  callback(null, deals);
};

/* Lets bootstrap with dummy data */
new DealRepository().save([
  {title: 'Post one', body: 'Body one', fileName: ''},
  {title: 'Post two', body: 'Body two', fileName: ''},
  {title: 'Post three', body: 'Body three', fileName: ''}
], function(error, deals){});

exports.DealRepository = DealRepository;






