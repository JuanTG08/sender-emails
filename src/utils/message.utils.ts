import { iMessage } from "../interface/iMessage.interface";

export const MessageUtils = (
  error: boolean,
  statusCode: number,
  message: string,
  payload: any = false
): iMessage => {
  return {
    error,
    statusCode,
    message,
    payload,
  };
};
