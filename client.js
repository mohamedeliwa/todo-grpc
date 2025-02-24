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

client.createTodo({ id: -1, text }, (err, res) => {
  console.log({
    res,
  });
});
