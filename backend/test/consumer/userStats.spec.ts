import { Request, Response } from 'express';
import { createSelectMock } from './mockDatabase';
import { get as getUserStats } from '@routes/user/stats/{:id}';
import { bjStatsView } from '@database/schema';
import { createMockResponse } from './jestHelpers';

const { from, where } = createSelectMock();

describe('GET /user/stats/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the user stats as JSON', async () => {
    where.mockResolvedValue([
      {
        userId: BigInt(1),
        minScore: 10,
        maxScore: 20,
        avgScore: 15.5,
        totalGames: 2,
        nbBlackjack: 0,
        nbGagne: 1,
        percentGagne: 0.5,
      },
    ]);

    const req = { params: { id: '1' } } as unknown as Request;
    const res = createMockResponse();

    await getUserStats(req, res);

    expect(from).toHaveBeenCalledWith(bjStatsView);
    expect(where).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.body).toBe(
      JSON.stringify({
        userId: '1',
        minScore: 10,
        maxScore: 20,
        avgScore: 15.5,
        totalGames: 2,
        nbBlackjack: 0,
        nbGagne: 1,
        percentGagne: 0.5,
      })
    );
  });
});
