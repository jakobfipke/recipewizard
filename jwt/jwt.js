const expressJwt = require('express-jwt');
require('dotenv').config({path: '../.env'});

module.exports = jwt;

// change the routes here to the full routes when hosted - eg. /recipewizard/api/v1/register
function jwt() {
  const secret = process.env.SECRET;
  return expressJwt({secret, algorithms: ['HS256']}).unless({
    path: [
      '/register',
      '/login'
    ]
  })
}