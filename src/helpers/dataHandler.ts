import { data, Request, Response } from '@serverless/cloud';
import {
  AcceptedData,
  DataAction,
} from '../interfaces/dataInterfaces';
import { removeTokenFromPayload } from '../utils/utils';
import cacheService from '../services/cache/cache.service';

const postDataHandler = async (
  req: Request,
  res: Response,
  dataSet: AcceptedData,
  action: DataAction,
) => {
  let {
    keyName,
    overwrite = undefined,
    timeToLive = undefined,
  } = dataSet.instructions;
  const { content } = dataSet;
  const { api_key } = req.headers;

  try {
    const option = { overwrite, timeToLive };
    const useOptions =
      Object.entries(option).length === 0 ? undefined : option;
    content.token = api_key;

    const record = (await data.set(
      keyName,
      content,
      useOptions,
    )) as object;

    const cachedExists = await cacheService.getCachedData(keyName);

    if (cachedExists) {
      await cacheService.deleteCachedData(keyName);
    }

    const payload = removeTokenFromPayload(record);

    return res.status(200).json({
      message: action,
      keyName,
      record: payload,
    });
  } catch (error) {
    const code = error.statusCode || 500;
    return res.status(code).json(error);
  }
};

export { postDataHandler };
