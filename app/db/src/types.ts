interface PubSubMessage {
  attributes: Record<string, string>;
  data: string;
  messageId: string;
  message_id: string;
  publishTime: string;
  publish_time: string;
}

interface PubSubReqBody {
  message: PubSubMessage;
  subscription: string;
}

export { PubSubReqBody };
