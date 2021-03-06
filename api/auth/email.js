var jsonBody = require("body/json")
var sendJson = require('send-data/json')

module.exports = EMail

function EMail(models) {
  this.models = models
}

EMail.prototype.create = function (req, res, opts, cb) {
  var self = this
  jsonBody(req, res, function (err, body) {
    if (err) throw err
    self.models.users.create({
      handle: body.handle,
      password: body.password,
      email: body.email
    }, function (err, id) {
      if (err) throw err
      sendJson(req, res, {'handle': id})
    })
  })
}

EMail.prototype.login = function (req, res, opts, cb) {
  jsonBody(req, res, function (err, body) {
    if (err) throw err
  })
}

EMail.prototype.callback = function(req, res) {
  res.end('no callback')
}