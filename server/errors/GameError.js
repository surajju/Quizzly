export class GameError extends Error {
  constructor(message) {
    super(message);
    this.name = 'GameError';
  }
}

export class GameNotFound extends GameError {
  constructor(message = 'Game not found') {
    super(message);
    this.name = 'GameNotFound';
  }
}

export class InvalidState extends GameError {
  constructor(message = 'Invalid state transition') {
    super(message);
    this.name = 'InvalidState';
  }
}

export class AlreadyAnswered extends GameError {
  constructor(message = 'Already answered') {
    super(message);
    this.name = 'AlreadyAnswered';
  }
}

export class GameFull extends GameError {
  constructor(message = 'Game is full') {
    super(message);
    this.name = 'GameFull';
  }
}

export class InvalidAction extends GameError {
  constructor(message = 'Invalid action') {
    super(message);
    this.name = 'InvalidAction';
  }
}
