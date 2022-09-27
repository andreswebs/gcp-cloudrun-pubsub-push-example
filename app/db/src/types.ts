interface PubSubHTTPMessage {
  attributes: Record<string, string>;
  data: string;
  messageId: string;
  message_id: string;
  publishTime: string;
  publish_time: string;
}

interface PubSubReqBody {
  message: PubSubHTTPMessage;
  subscription: string;
}

export { PubSubReqBody, PubSubHTTPMessage };
