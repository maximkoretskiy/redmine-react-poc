var aja = require('aja');
var lf = require('localforage');
var _ = require('lodash');

var settings = require('./settings');

// lf.config({
//     driver: lf.WEBSQL
// });

var Cacher = function(settings){
  this.settings = settings;
}

Cacher.prototype.getQueryUrl = function(){
  var url = this.settings.redminePath + '/issues.json';
  return url;
};

Cacher.prototype.getPage = function(page,cb) {
  var pageSize = this.settings.pageSize;
  var data = {
    key: this.settings.key,
    limit: pageSize,
    offset: page * pageSize
  };
  aja()
  .url(this.getQueryUrl())
  .data(data)
  .on('success', function(data){
    this.addData(data);
    cb(data.issues.length)
    console.log(data);
  }.bind(this))
  .go()
};

Cacher.prototype.getAllData = function() {
  var pageNum = 0;
  var step = function(){
    this.getPage(pageNum, function(count){
      if(count > 0){
        pageNum++;
        step();
      }
    });
  }.bind(this);
  step();
};

Cacher.prototype.addData = function(data) {
  data.issues.forEach(function(item){
    var mainData = _.pick(item, ['id','subject']);
    lf.setItem('issue-'+item.id, mainData);
  })
};

var cacher = new Cacher(settings);
cacher.getAllData();
