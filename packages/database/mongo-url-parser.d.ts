declare module 'mongo-url-parser' {
  type MongoConnectionProperties = {
    auth: { user: string; password: string };
    servers: [{ host: string; port: number }];
    dbName: string;
  };

  export default function (uri: string): MongoConnectionProperties;
}
