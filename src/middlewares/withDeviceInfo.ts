import { NextFunction, Request, Response } from 'express';
import useragent from 'useragent';


async function withDeviceInfo(req: Request, res: Response, next: NextFunction) {
  try {
    const userAgent = req.headers['user-agent'];
    const agent = useragent.parse(userAgent);
    const deviceInfo = {
      browser: agent.toJSON().family,
      version: agent.toJSON().major,
      os: agent.os.toJSON().family,
      osVersion: agent.os.toJSON().major,
      device: agent.device.toJSON().family
    };
    req.deviceInfo = deviceInfo
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export default withDeviceInfo;
