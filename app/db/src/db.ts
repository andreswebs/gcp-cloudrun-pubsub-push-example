import { Schema, InferSchemaType, createConnection } from 'mongoose';

const mongoProto = process.env.MONGO_PROTO || 'mongodb+srv';
const mongoHost = process.env.MONGO_HOST;
const mongoDatabase = process.env.MONGO_DATABASE || 'app';
const mongoUser = process.env.MONGO_USER || 'app';
const mongoPass = process.env.MONGO_PASSWORD;

const mongoURI = `${mongoProto}://${mongoUser}:${mongoPass}@${mongoHost}/${mongoDatabase}?retryWrites=true&w=majority`;

const mongoOptions = { connectTimeoutMS: 40000 };

const messageSchema = new Schema({
  msgId: { type: String, required: true },
  msg: { type: String },
  attributes: { type: Object },
});

type MessageSchema = InferSchemaType<typeof messageSchema>;

const conn = createConnection(mongoURI, mongoOptions);

conn.on('connected', () => {
  console.log('DB connection open');
});
conn.on('error', (err) => {
  console.log(`DB connection error: ${err}`);
});
conn.on('disconnected', () => {
  console.log('DB connection terminated');
});

const Message = conn.model<MessageSchema>('Message', messageSchema);

const db = { Message };

export default db;

export type { MessageSchema };
