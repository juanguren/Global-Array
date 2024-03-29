import {
  AcceptedData,
  DataAction,
} from '../interfaces/dataInterfaces';
import { data, Request, Response } from '@serverless/cloud';
import { postDataHandler } from '../helpers/dataHandler';
import { removeTokenFromPayload } from '../utils/utils';

const getDataRecord = async (req: Request, res: Response) => {
  const { key } = req.params;

  try {
    const response = await utilsGetKey(key);
    if (response) {
      const payload = removeTokenFromPayload(response);
      return res.status(200).json({ data: payload });
    }
    throw {
      message: `No data associated with the ${key} key`,
      code: 404,
    };
  } catch (error) {
    return res.send(error);
  }
};

const createDataRecord = async (req: Request, res: Response) => {
  const { content, instructions } = req.body;
  const { keyName } = instructions;
  let action: DataAction = DataAction.CREATE;

  const contentValue = Object.entries(content);
  try {
    if (contentValue.length > 0) {
      const data: AcceptedData = {
        content,
        instructions,
      };
      if (await utilsGetKey(keyName)) action = DataAction.UPDATE;

      return await postDataHandler(req, res, data, action);
    } else {
      throw { message: 'Empty content key' };
    }
  } catch (error) {
    const { message, code = 400 } = error;
    return res.status(code).json({ message });
  }
};

const deleteDataRecord = async (req: Request, res: Response) => {
  const { key: keyName } = req.params;
  try {
    const response = await data.remove(keyName);

    if (response) {
      return res
        .status(200)
        .json({ message: 'Entry deleted succesfully' });
    }
    throw 'Server error';
  } catch (error) {
    res.status(500).json(error);
  }
};

const utilsGetKey = async (key: string): Promise<any> =>
  await data.get(key);

export {
  getDataRecord,
  createDataRecord,
  deleteDataRecord,
  utilsGetKey,
};
