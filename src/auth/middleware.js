'use strict';

const User = require('./users-model.js');

module.exports = (req, res, next) => {

  try {
    if (!req.headers.authorization) {
      console.error('no authorization header found')
      return _authError();
    }
    console.log('authorization header found')
    let [authType, authString] = req.headers.authorization.split(/\s+/);

    switch (authType.toLowerCase()) {
      case 'basic':
        return _authBasic(authString);
      case 'bearer':
        return _authBearer(authString);
      default:
        return _authError();
    }
  } catch (e) {
    next(e);
  }


  function _authBasic(str) {
    // str: am9objpqb2hubnk=
    console.log('here 1')
    let base64Buffer = Buffer.from(str, 'base64'); // <Buffer 01 02 ...>
    let bufferString = base64Buffer.toString(); // john:mysecret
    let [username, password] = bufferString.split(':'); // john='john'; mysecret='mysecret']
    let auth = {
      username,
      password
    }; // { username:'john', password:'mysecret' }
    console.log('here 2')
    return User.authenticateBasic(auth)
      .then(user => _authenticate(user))
      .catch(next);
  }

  function _authBearer(token) {
    return User.authenticateToken(token)
      .then(user => {
        if (user) {
          req.user = user;
          req.token = user.generateToken();
          next();
        } else _authError()
      })
  }

  function _authenticate(user) {
    if (user) {
      req.user = user;
      req.token = user.generateToken();
      next();
    } else {
      _authError();
    }
  }

  function _authError() {
    res.status(401).send('Unauthorized');
    // next('Invalid User ID/Password');
    next('credentials not valid')
  }

};