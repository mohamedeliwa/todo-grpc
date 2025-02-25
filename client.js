import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";

const packageDef = protoLoader.loadSync("todo.proto", {});

const grpcObject = grpc.loadPackageDefinition(packageDef);

const todoPackage = grpcObject.todoPackage;

const client = new todoPackage.Todo(
  "0.0.0.0:3000",
  grpc.credentials.createInsecure()
);

const text = process.argv[2];

// Unary
client.createTodo({ id: -1, text }, (err, res) => {
  console.log({
    create: res,
  });
});

// sync
client.readTodos({}, (err, res) => {
  res.items.forEach((item) => {
    console.log(item.text);
  });
});

// server streaming
const call = client.readTodosStream();
call.on("data", (item) => {
  console.log(item.text);
});

call.on("end", e => console.log("server done streaming"));