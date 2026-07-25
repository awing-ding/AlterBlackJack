import { db } from '@database/connexion';
import { bjGames, bjPlayed } from '@database/schema';

jest.mock('@database/connexion', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
  },
}));

type MockDb = {
  select: jest.Mock;
  insert: jest.Mock;
};

export const mockDb = db as unknown as MockDb;

export function createSelectMock() {
  const where = jest.fn();
  const from = jest.fn(() => ({ where }));

  mockDb.select.mockReturnValue({ from });

  return { from, where };
}

export function createGameInsertMock() {
  const returning = jest.fn();
  const gameValues = jest.fn(() => ({ returning }));
  const playedValues = jest.fn().mockResolvedValue(undefined);

  mockDb.insert.mockImplementation((table: typeof bjGames | typeof bjPlayed) => {
    if (table === bjGames) {
      return { values: gameValues };
    }

    if (table === bjPlayed) {
      return { values: playedValues };
    }

    throw new Error('Unexpected table');
  });

  return { gameValues, returning, playedValues };
}
