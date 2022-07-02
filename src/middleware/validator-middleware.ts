import { params, Request, Response } from '@serverless/cloud';
import { utilsGetKey } from '../services/cloud.service';
import cacheService from '../services/cache/cache.service';

const validateUserToken = (
  req: Request,
  res: Response,
  next: CallableFunction,
) => {
  const { APP_TOKENS } = params;
  const { api_key } = req.headers;
  try {
    if (api_key) {
      const tokenList = APP_TOKENS.split(',');
      if (tokenList.includes(api_key)) return next();
      throw {
        message: 'Incorrect token. User is not authenticated',
        code: 403,
      };
    } else {
      throw { message: 'Please send an api_key header', code: 404 };
    }
  } catch (error) {
    const { code, message } = error;
    res.status(code).json({ message });
  }
};

const userKeyGuard = async (
  req: Request,
  res: Response,
  next: CallableFunction,
) => {
  const { api_key } = req.headers;
  const keyNameClaimedErrorMsg = {
    message: 'Key Name has already being claimed.',
    code: 403,
  };
  try {
    if (req.method == 'POST') {
      const { keyName } = req.body.instructions;
      const data = await utilsGetKey(keyName);

      if (data) {
        if (api_key == data.token) return next();
        throw keyNameClaimedErrorMsg;
      }
      return next();
    } else {
      const { key } = req.params;
      const data = await utilsGetKey(key);

      if (data) {
        if (api_key == data.token) return next();
        throw keyNameClaimedErrorMsg;
      }
      return next();
    }
  } catch (error) {
    const { code = 500, message } = error;
    res.status(code).json({ warning: message });
  }
};

export const validateRecordExists = async (
  req: Request,
  res: Response,
  next: CallableFunction,
) => {
  const { key } = req.params;
  try {
    const cached = await cacheService.getData(key);
    if (cached) return next();

    const response = await utilsGetKey(key);
    if (response) return next();

    throw {
      message: `Record does not exist`,
      code: 404,
    };
  } catch (error) {
    const { message, code } = error;
    return res.status(code || 500).json({ message });
  }
};

export { validateUserToken, userKeyGuard };
