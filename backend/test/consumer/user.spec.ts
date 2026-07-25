import { Request, Response } from 'express';
import { createSelectMock } from './mockDatabase';
import { get as getUser } from '@routes/user/{:id}';
import { bjPlayed } from '@database/schema';
import { createMockResponse } from './jestHelpers';

const { from, where } = createSelectMock();

describe('GET /user/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the user history as JSON', async () => {
    where.mockResolvedValue([
      { userId: BigInt(1), gameId: 1, won: false, playerScore: 18, blackjack: false },
    ]);

    const req = { params: { id: '1' } } as unknown as Request;
    const res = createMockResponse();

    await getUser(req, res);

    expect(from).toHaveBeenCalledWith(bjPlayed);
    expect(where).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.body).toBe(
      JSON.stringify([
        { userId: '1', gameId: 1, won: false, playerScore: 18, blackjack: false },
      ])
    );
  });
});
