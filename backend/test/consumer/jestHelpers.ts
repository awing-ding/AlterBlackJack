import { Response } from 'express';

export function createMockResponse() {
  const res: {
    body: unknown;
    status: jest.Mock;
    send: jest.Mock;
  } = {
    body: undefined as unknown,
    status: jest.fn().mockReturnThis(),
    send: jest.fn((body?: unknown) => {
      res.body = body;
      return res;
    }),
  };

  return res as unknown as Response & { body: unknown };
}
