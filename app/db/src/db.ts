import { Schema, InferSchemaType, createConnection } from 'mongoose';

import {
  mongoProto,
  mongoHost,
  mongoDatabase,
  mongoUser,
  mongoPass,
} from './constants';

const mongoURI = `${mongoProto}://${mongoUser}:${mongoPass}@${mongoHost}/${mongoDatabase}?authSource=admin`;

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
