var githubOAuth = require('github-oauth')
var request = require('request')
var extend = require('extend')
var debug = require('debug')('github-provider')
var redirecter = require('redirecter')
var waterfall = require('run-waterfall')

var defaults = require('../defaults.js')

module.exports = function(models, overrides) {
  var options = {
    githubClient: defaults['GITHUB_CLIENT'],
    githubSecret: defaults['GITHUB_SECRET'],
    baseURL: defaults['DAT_REGISTRY_HOST'] || 'http://localhost:5000',
    loginURI: '/auth/login',
    callbackURI: '/auth/callback',
    scope: 'user' // optional, default scope is set to user
  }

  var gh = githubOAuth(extend({}, options, overrides))

  gh.on('error', function(err) {
    console.error('there was a login error', err)
  })

  gh.on('token', function(token, res, tokenResponse, req) {
    var params = {
      url: 'https://api.github.com/user?access_token=' + token.access_token,
      headers: {
          'User-Agent': 'datproject.dat-registry'
      },
      json: true
    }

    if (!token.access_token) {
      res.end('improper access token')
    } else {
      request(params, githubUserDataCallback)
    }

    function githubUserDataCallback(err, response, body) {
      debug('github user data response', {
        status: response.statusCode,
        body: body
      })
      if (err) throw err

      waterfall([
        function (callback) {
          getOrCreateGithubUser(body, callback)
        },
        function (user, callback) {
          loginUser(req, user, callback)
        }
      ],
        function (err) {
          //the finisher
          var type, text;
          if (err) {
            throw err
          }
          debug('redirecting')
          redirecter(req, res, '/')
        }
      )
    }
  })

  function getOrCreateGithubUser(user, callback) {
    // get or create user
    debug('getting user', user)

    models.users.byGithubId.get(user.id, function (err, newUser) {
      if (err) {
        // user doesn't exist, so we create a new one
        newUser = {
          handle: user.login,
          githubId: user.id,
          password: 'password', // dummy password.
          data: {
            email: user.email,
            name: user.name,
            location: user.location,
            bio: user.bio,
            blog: user.blog,
            company: user.company,
            login: user.login
          }
        }
        debug('creating new user', newUser)
        models.users.create(newUser, function (err, handle) {
          if (err) {
            debug('cannot create user in database', newUser)
            return callback(err)
          }
          debug('new user created', handle)
          return callback(null, newUser)
        })
      }
      else {
        debug('calling back', newUser)
        return callback(null, newUser)
      }
    })
  }

  function loginUser(req, user, callback) {
    // delete current session and set new session
    req.session.del('userid', function (err) {
      if (err) return callback(err)
      req.session.set('userid', user.handle, function(err) {
        if (err) return callback(err)
        return callback(null)
      })
    })
  }
  return gh
}
