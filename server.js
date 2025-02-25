import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";

const packageDef = protoLoader.loadSync("todo.proto", {});

const grpcObject = grpc.loadPackageDefinition(packageDef);

const todoPackage = grpcObject.todoPackage;

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

server.bindAsync(
  "0.0.0.0:3000",
  grpc.ServerCredentials.createInsecure(),
  () => {
    console.log("server is listening on port 3000");
  }
);
