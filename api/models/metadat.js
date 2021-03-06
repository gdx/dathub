var RestModels = require('level-restful'),
    timestamp = require('monotonic-timestamp')
    util = require('util'),
    jsonBody = require("body/json");

module.exports = MetaDat;

function MetaDat(db) {
  // MetaDat is the metadata for a particular dat instance.
  // id is the primary key, auto incremented by timestamp
  fields = [
    {
      'name': 'owner_id',
      'type': 'string',
      'index': true
    },
    {
      'name': 'description',
      'type': 'string'
    },
    {
      'name': 'name',
      'type': 'string',
      'index': true
    },
    {
      'name': 'json',
      'type': 'object'
    },
    {
      'name': 'url',
      'type': 'string',
      'index': true
    },
    {
      'name': 'license',
      'type': 'string',
      'optional': true,
      'default': 'BSD'
    }
    // {
    //   'name': 'schema',
    //   'type': 'string',
    //   'optional': true
    // },
  ]
  opts = {}
  RestModels.call(this, db, 'metadat', 'id', fields, opts);
}

util.inherits(MetaDat, RestModels);
MetaDat.prototype.keyfn = timestamp