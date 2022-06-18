import 'dotenv/config'
import * as http from 'http';
import * as url from 'url';
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';

interface User {
  id?: string;
  username: string;
  age: number;
  hobbies: string[];
}

enum Status {
  'Ok' = 200,
  'Created' = 201,
  'No Content' = 204,
  'Bad Request' = 400,
  'Not Found' = 404,
  'Server Error' = 500,
}

let users: User[] = [];

const host = 'localhost';

const requestHandler = function (req, res): void {
  let statusCode: Status;
  let response:  User | {[key: string]: string | Status};
  const { pathname, query } = url.parse(req.url, true);

  res.setHeader("Content-Type", "application/json");

  if (pathname === '/api/users'
    && req.method === 'GET'
    && query.id) {
    try{
      const user: User = users.find(user => user.id === query.id);

      if (user) {
        statusCode = Status.Ok;
        response = user;
      } else if (!uuidValidate(query.id)) {
        statusCode = Status['Bad Request'];
        response = {
          status: Status['Bad Request'],
          error: Status[Status['Bad Request']] 
        };
      } else {
        statusCode = Status['Not Found'];
        response = {
          status: Status['Not Found'],
          error: Status[Status['Not Found']] 
        };
      }
  
      res.writeHead(statusCode);
      res.end(JSON.stringify(response));
    } catch {
      res.writeHead(Status['Server Error']);
      res.end(JSON.stringify({
        status: Status['Server Error'],
        error: Status[Status['Server Error']]
      }));
    }
  } else if (pathname === '/api/users'
    && req.method === 'GET'
    && !query.id) {
    try {
      Array.isArray(users);
      res.writeHead(200);
      res.end(JSON.stringify(users));
    } catch {
      res.writeHead(Status['Server Error']);
      res.end(JSON.stringify({
        status: Status['Server Error'],
        error: Status[Status['Server Error']]
      }));
    }
  } else if (pathname === '/api/users'
    && req.method === 'POST') {
    try {
      Array.isArray(users);
      (async () => {
        let user: User;

        await req.on('data', (chunk: User) => {
          user = JSON.parse(chunk as unknown as string);
        });

        const { username, age, hobbies } = user;

        if (username !== undefined
          && age !== undefined
          && hobbies !== undefined) {
          const newUser: User = {
            username,
            age,
            hobbies,
            id: uuidv4(),
          }

          users.push(newUser);

          statusCode = Status.Created;
          response = newUser;
        } else {
          statusCode = Status['Bad Request'];
          response = {
            status: Status['Bad Request'],
            error: Status[Status['Bad Request']] 
          };
        }

        res.writeHead(statusCode);
        res.end(JSON.stringify(response));
      })();
    } catch {
      res.writeHead(Status['Server Error']);
      res.end(JSON.stringify({
        status: Status['Server Error'],
        error: Status[Status['Server Error']]
      }));
    }
  } else if (pathname === '/api/users'
    && req.method === 'PUT'
    && query.id) {
    try{
      Array.isArray(users);
      (async () => {
        let userDataToUpdate: User;
        let userIndexInArray: number; 
        const user: User = users.find((user, index) => {
          userIndexInArray = index;
          return user.id === query.id
        });
  
        if (user) {
          await req.on('data', (chunk: User) => {
            userDataToUpdate = JSON.parse(chunk as unknown as string);
          });
    
          const { username, age, hobbies } = userDataToUpdate;
          const updatedUser: User = {
            id: user.id,
            username: username ?? user.username,
            age: age ?? user.age,
            hobbies: hobbies ?? user.hobbies
          }

          users.splice(userIndexInArray, 1, updatedUser);

          statusCode = Status.Ok;
          response = updatedUser;
        } else if (!uuidValidate(query.id)) {
          statusCode = Status['Bad Request'];
          response = {
            status: Status['Bad Request'],
            error: Status[Status['Bad Request']]
          };
        } else {
          statusCode = Status['Not Found'];
          response = {
            status: Status['Not Found'],
            error: Status[Status['Not Found']]
          };
        }
  
        res.writeHead(statusCode);
        res.end(JSON.stringify(response));
      })();
    } catch {
      res.writeHead(Status['Server Error']);
      res.end(JSON.stringify({
        status: Status['Server Error'],
        error: Status[Status['Server Error']]
      }));
    }
  } else if (pathname === '/api/users'
    && req.method === 'DELETE'
    && query.id) {
    try{
      const user: User = users.find(user => user.id === query.id);

      if (user) {
        users = users.filter(item => item.id !== query.id)
        statusCode = Status['No Content'];
      } else if (!uuidValidate(query.id)) {
        statusCode = Status['Bad Request'];
        response = {
          status: Status['Bad Request'],
          error: Status[Status['Bad Request']] 
        };
      } else {
        statusCode = Status['Not Found'];
        response = {
          status: Status['Not Found'],
          error: Status[Status['Not Found']] 
        };
      }
  
      res.writeHead(statusCode);
      res.end(JSON.stringify(response));
    } catch {
      res.writeHead(Status['Server Error']);
      res.end(JSON.stringify({
        status: Status['Server Error'],
        error: Status[Status['Server Error']]
      }));
    }
  } else {
    res.writeHead(Status['Not Found']);
    res.end(JSON.stringify(
      {
        status: Status['Not Found'],
        error: Status[Status['Not Found']]
      }
    ));
  }
};

export const app = () => {
  const server = http.createServer(requestHandler);
  server.listen(Number(process.env.PORT), host, () => {
      console.log(`Server is running on http://${host}:${process.env.PORT}`);
  });
}
