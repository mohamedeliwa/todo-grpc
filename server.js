import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";

const packageDef = protoLoader.loadSync("todo.proto", {});

const grpcObject = grpc.loadPackageDefinition(packageDef);

const todoPackage = grpcObject.todoPackage;

const server = new grpc.Server();

server.addService(todoPackage.Todo.service, {
  createTodo: createTodo,
  readTodos: readTodos,
});

const todos = [];

function createTodo(call, callback) {
  const todoItem = {
    id: todos.length,
    text: call.request.text,
  };
  todos.push(todoItem);
  callback(null, todoItem);
}

function readTodos(call, callback) {
  console.log(call);
}

server.bindAsync(
  "0.0.0.0:3000",
  grpc.ServerCredentials.createInsecure(),
  () => {
    console.log("server is listening on port 3000");
  }
);
