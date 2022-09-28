import { Schema, InferSchemaType, createConnection } from 'mongoose';

import { mongoURI } from './constants';

const mongoOptions = { connectTimeoutMS: 100000 };

const messageSchema = new Schema({
  msgId: { type: String, required: true },
  msg: { type: String },
  luck: { type: Number },
  attributes: { type: Object },
});

type MessageSchema = InferSchemaType<typeof messageSchema>;

const conn = createConnection(mongoURI, mongoOptions);

conn.on('connected', () => {
  console.log('DB connection open');
});

conn.on('error', (err: Error) => {
  console.log(`DB connection error: ${err.message}`);
});

conn.on('disconnected', () => {
  console.log('DB connection terminated');
});

const Message = conn.model<MessageSchema>('Message', messageSchema);

const db = { Message, connection: conn.asPromise() };

export default db;

export type { MessageSchema };
