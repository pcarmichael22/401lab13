'use strict';

process.env.SECRET = 'test';

const jwt = require('jsonwebtoken');

const server = require('../../../src/app.js').server;
const supergoose = require('../../supergoose.js');

const mockRequest = supergoose.server(server);

let users = {
  admin: {
    username: 'admin',
    password: 'password',
    role: 'admin'
  },
  editor: {
    username: 'editor',
    password: 'password',
    role: 'editor'
  },
  user: {
    username: 'user',
    password: 'password',
    role: 'user'
  },
};

beforeAll(supergoose.startDB);
afterAll(supergoose.stopDB);

describe('Auth Router', () => {

  Object.keys(users).forEach(userType => {

    describe(`${userType} users`, () => {

      let encodedToken;
      let id;

      it('can create one', () => {
        return mockRequest.post('/signup')
          .send(users[userType])
          .then(results => {
            encodedToken = results.text;
            var token = jwt.verify(results.text, process.env.SECRET);
            id = token.id;
            encodedToken = results.text;
            expect(token.id).toBeDefined();
          });
      });

      it('can signin with basic', () => {
        return mockRequest.post('/signin')
          .auth(users[userType].username, users[userType].password)
          .then(results => {
            var token = jwt.verify(results.text, process.env.SECRET);
            encodedToken = results.text;
            // console.log(encodedToken);
            // console.log(results)
            expect(token.id).toEqual(id);
          });
      });

      it('cant call test without token', () => {
        return mockRequest.get('/test')
          .then((response) => {
            expect(response.statusCode).toBe(401);
          });
      });

      it('can call test with token', () => {
        return mockRequest.get('/test')
          .set('Authorization', `Bearer ${encodedToken}`)
          .then((response) => {
            console.log(response.body)
            expect(response.statusCode).toBe(200);
            expect(response.type).toBe('application/json');
          })
      });

      it('wait 2 seconds between tests', () => {
        jest.useFakeTimers();
        setTimeout(() => {
          return mockRequest.get('/test')
          .set('Authorization', `Bearer ${encodedToken}`)
          .then((response) => {
            console.log(response.body)
            expect(response.statusCode).toBe(200);
            expect(response.type).toBe('application/json');
          })
        }, 2000);
        jest.runAllTimers();
       });

      //  it('cant call test with expired token', () => {
      //   return mockRequest.get('/test')
      //     .set('Authorization', `Bearer ${encodedToken}`)
      //     .then((response) => {
      //       console.log(response.body)
      //       expect(response.statusCode).toBe(200);
      //       expect(response.type).toBe('application/json');
      //     })
      // });

    })

  });

});

      // describe('GET /', () => {
      //   // token not being sent - should respond with a 401
      //   test('It should require authorization', () => {
      //     return request(app)
      //       .get('/')
      //       .then((response) => {
      //         expect(response.statusCode).toBe(401);
      //       });
      //   });
      //   // send the token - should respond with a 200
      //   test('It responds with JSON', () => {
      //     return request(app)
      //       .get('/')
      //       .set('Authorization', `Bearer ${token}`)
      //       .then((response) => {
      //         expect(response.statusCode).toBe(200);
      //         expect(response.type).toBe('application/json');
      //       });
      //   });
      // });

      // use token from above to test authentication to a different route
   

    

  //   // wait 2 sseconds (token expires in 1 second)

  //   // use token from above to test authentiation to the same route above (shouldn't work)
//   // });

// });