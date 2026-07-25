import { Request, Response } from 'express';
import { createGameInsertMock, createSelectMock } from './mockDatabase';
import { get as getGame, post as postGame } from '@routes/game/{:id}';
import { bjGames, bjPlayed } from '@database/schema';
import { createMockResponse } from './jestHelpers';

const { from, where } = createSelectMock();
const { gameValues, returning, playedValues } = createGameInsertMock();

describe('GET /game/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the game as JSON', async () => {
    where.mockResolvedValue([{ id: 1, dealerScore: 20, nbPlayer: 1 }]);

    const req = { params: { id: '1' } } as unknown as Request;
    const res = createMockResponse();

    await getGame(req, res);

    expect(from).toHaveBeenCalledWith(bjGames);
    expect(where).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.body).toBe(JSON.stringify({ id: 1, dealerScore: 20, nbPlayer: 1 }));
  });
});

describe('POST /game/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('stores the game and played rows', async () => {
    returning.mockResolvedValue([{ id: 7 }]);

    const req = {
      body: {
        dealerScore: 20,
        nbPlayers: 1,
        players: [{ userId: '1', won: false, playerScore: 18, blackjack: false }],
      },
    } as unknown as Request;
    const res = createMockResponse();

    await postGame(req, res);

    expect(gameValues).toHaveBeenCalledWith({ dealerScore: 20, nbPlayer: 1 });
    expect(returning).toHaveBeenCalledWith({ id: bjGames.id });
    expect(playedValues).toHaveBeenCalledWith([
      { gameId: 7, userId: BigInt(1), won: false, playerScore: 18, blackjack: false },
    ]);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.body).toBeUndefined();
  });
});
