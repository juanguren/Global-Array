import { data } from '@serverless/cloud';

const removeTokenFromPayload = (payload: any) => {
  delete payload.token;
  return payload;
};

export { removeTokenFromPayload };
