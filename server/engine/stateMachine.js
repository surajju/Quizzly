import { InvalidState } from '../errors/GameError.js';

export const STATES = {
  LOBBY: 'lobby',
  QUESTION: 'question',
  REVEAL: 'reveal',
  ENDED: 'ended',
};

const TRANSITIONS = {
  [STATES.LOBBY]: [STATES.QUESTION],
  [STATES.QUESTION]: [STATES.REVEAL],
  [STATES.REVEAL]: [STATES.QUESTION, STATES.ENDED],
  [STATES.ENDED]: [STATES.LOBBY],
};

export function canTransition(from, to) {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function transition(game, targetState) {
  const from = game.state;
  if (!canTransition(from, targetState)) {
    throw new InvalidState(`Cannot transition from ${from} to ${targetState}`);
  }
  game.state = targetState;
}
