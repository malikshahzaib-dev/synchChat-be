import { Response, NextFunction } from "express";

const catchAsync = (
  fn: (req: any, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: any, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
};

export default catchAsync;
