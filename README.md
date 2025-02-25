# todo-grpc

a todo app (server, client) built with gRPC protocol

# How to build it

1. start a new nodejs project

create a new directory for our project

```bash
$ mkdir todo-grpc
```

inside the newly created project, start a nodejs project

```bash
$ npm init
```

a new file will be generated, called `package.json`
in this file, add the following entry, this will allow us to use ES6 modules instead of CommonJs modules

```json
 "type": "module"
```

2. Install dependencies

using npm install the needed dependencies

- "@grpc/grpc-js": which is the gRPC client
- "@grpc/proto-loader": A utility package for loading defined packages and services within .proto files for use with gRPC

```bash
$ npm install @grpc/grpc-js @grpc/proto-loader
```

here is the exact versions of both packages I used while building this project

```json
 "@grpc/grpc-js": "^1.12.6",
 "@grpc/proto-loader": "^0.7.13"
```

3. create todo.proto, server.js, and client.js files

```bash
$ touch todo.proto server.js client.js
```

## Building the schema

let's start by building the schema that we will use to communicate between the server and the client

inside the todo.proto file

define a package called `todoPackage`, that contains a service called `Todo`\

todo service will contain the definition of our methods used for communication

- `createTodo`: used to create a todo, accept a `TodoItem` (we will define it later), and returns the created `TodoItem`
- `readTodos`: used to read todos from the server, takes no params and returns `TodoItems` (we will define it later)
- `readTodosStream`: used to stream todos from the server one by one, instead of sending all todos in one chunck like `readTodos`, this is more effecient for sending large data

```proto
syntax = "proto3";

package todoPackage;

service Todo {
     // unary gRPC
    rpc createTodo(TodoItem) returns(TodoItem);
    // synchronous
    rpc readTodos(NoParams) returns(TodoItems);
    // server streaming
    rpc readTodosStream(NoParams) returns(stream TodoItem);
};
```

The first line is defining the version of proto sytanx we are using.

After that we need to define the types we used as method params and return types

- `NoParams`: represents a method that takes no params
- `TodoItem`: represents the structure of each todo
- `TodoItems`: is a struct/object that contains a property called items which is a array/list of type `TodoItem`, we represent lists/arrays using the keyword `repeated`

```proto
message NoParams {};

message TodoItem {
    int32 id = 1;
    string text = 2;
};

message TodoItems {
    repeated TodoItem items = 1;
};
```

## Building the server

let's start by importing our dependencies

```js
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
```

then we need to load the schema we defined in the `todo.proto` file, into the gRPC client

```js
const packageDef = protoLoader.loadSync("todo.proto", {});

const grpcObject = grpc.loadPackageDefinition(packageDef);

// we can access our defined package using the dot notation
const todoPackage = grpcObject.todoPackage;
```

then we need to create an instance of gRPC server, and add our todo service inside it.\

the todo service expects us to provide it with the actual implementation of the methods we defined in the schema.\

```js
const server = new grpc.Server();

server.addService(todoPackage.Todo.service, {
  createTodo: createTodo,
  readTodos: readTodos,
  readTodosStream: readTodosStream,
});

const todos = [];

// Unary
function createTodo(call, callback) {
  const todoItem = {
    id: todos.length,
    text: call.request.text,
  };
  todos.push(todoItem);
  callback(null, todoItem);
}

// Sync
function readTodos(call, callback) {
  callback(null, { items: todos });
}

// server stream
function readTodosStream(call, callback) {
  todos.forEach((todo) => {
    call.write(todo);
  });
  call.end();
}
```

we created an array called todo, to act as an in-memory storage for incoming todos.

Notice:\

- inside the `createTodo` method,

  - we were able to access the incoming todo item through the `call` object, as `call.request` is the `todoItem` data send in the call. (similar to request.body in REST Apis)
  - after saving the todo in the array, we called the callback method, passing it our created item

- inside the `readTodos` method,

  - we call the callback method with all the todos we have in one shot

- inside the `readTodosStream`
  - we loop over the todos and send each todo alone, streaming the response to the client

The last step is to bind the server to a port and start listening

```js
server.bindAsync(
  "0.0.0.0:3000",
  grpc.ServerCredentials.createInsecure(),
  () => {
    console.log("server is listening on port 3000");
  }
);
```
