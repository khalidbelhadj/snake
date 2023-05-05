import { useEffect, useRef, useState } from 'react';
import { useInterval } from './useInterval';

const WIDTH = 35;
const HEIGHT = 35;
const SCALE_FACTOR = 30;
const DELAY = 200;
const START_NODE_COUNT = 3;
const START_X = Math.floor(HEIGHT / 2);
const START_Y = Math.floor(WIDTH / 2);

const WHITE = '#FFFFFF';
const BLACK = '#000000';
const RED = '#FF0000';

type Node = {
  x: number;
  y: number;
};

type Direction = 'left' | 'right' | 'up' | 'down';

type Snake = {
  direction: Direction;
  body: Node[];
};

type GameState = {
  snake: Snake;
  food: Node;
};

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>({
    snake: {
      direction: 'down',
      body: [],
    },
    food: {
      x: 0,
      y: 0,
    },
  });

  function generateFood(state: GameState) {
    let foodX = Math.floor((Math.round(Math.random() * 10) * (WIDTH - 1)) / 10);

    let foodY = Math.floor(
      (Math.round(Math.random() * 10) * (HEIGHT - 1)) / 10
    );
    Math.round;
    state.food.x = foodX;
    state.food.y = foodY;
  }

  function onNewGame() {
    if (gameState.snake.body.length > 0) {
      return;
    }

    let newGameState: GameState = { ...gameState };

    newGameState.food.x = START_X;
    newGameState.food.y = START_Y + START_NODE_COUNT * 2;

    for (let i = 0; i < START_NODE_COUNT; ++i) {
      console.log(`pushing node ${START_X} ${START_Y + i}`);
      newGameState.snake.body.push({
        x: START_X,
        y: START_Y,
      });
    }

    setGameState(newGameState);
  }

  function drawGame(ctx: CanvasRenderingContext2D) {
    // Drawing background
    ctx.fillStyle = BLACK;
    ctx.fillRect(0, 0, WIDTH * SCALE_FACTOR, HEIGHT * SCALE_FACTOR);

    // Drawing food
    ctx.fillStyle = WHITE;
    let { x, y } = gameState.food;
    ctx.fillRect(
      x * SCALE_FACTOR,
      y * SCALE_FACTOR,
      SCALE_FACTOR,
      SCALE_FACTOR
    );

    // Drawing snake
    ctx.fillStyle = RED;
    for (let { x, y } of gameState.snake.body) {
      ctx.fillRect(
        x * SCALE_FACTOR,
        y * SCALE_FACTOR,
        SCALE_FACTOR,
        SCALE_FACTOR
      );
    }
  }

  function growSnake() {
    let newGameState = { ...gameState };
    let tail: Node;
    switch (newGameState.snake.direction) {
      case 'up': {
        tail = newGameState.snake.body[newGameState.snake.body.length - 1];
        newGameState.snake.body.push({ x: tail.x, y: tail.y + 1 });
        break;
      }
      case 'down': {
        tail = newGameState.snake.body[newGameState.snake.body.length - 1];
        newGameState.snake.body.push({ x: tail.x, y: tail.y - 1 });
        break;
      }
      case 'left': {
        tail = newGameState.snake.body[newGameState.snake.body.length - 1];
        newGameState.snake.body.push({ x: tail.x + 1, y: tail.y });
        break;
      }
      case 'right': {
        tail = newGameState.snake.body[newGameState.snake.body.length - 1];
        newGameState.snake.body.push({ x: tail.x - 1, y: tail.y });
        break;
      }
    }
    setGameState(newGameState);
    setScore(() => score + 1);
  }

  function handleKeyDown(event: KeyboardEvent) {
    const { key } = event;

    let newGameState = { ...gameState };

    switch (key) {
      case 'ArrowUp': {
        if (gameState.snake.direction !== 'down') {
          newGameState.snake.direction = 'up';
        }
        break;
      }
      case 'ArrowDown': {
        if (newGameState.snake.direction !== 'up') {
          newGameState.snake.direction = 'down';
        }
        break;
      }
      case 'ArrowLeft': {
        if (newGameState.snake.direction !== 'right') {
          newGameState.snake.direction = 'left';
        }
        break;
      }
      case 'ArrowRight': {
        if (newGameState.snake.direction !== 'left') {
          newGameState.snake.direction = 'right';
        }
        break;
      }
      default:
        break;
    }

    if (!running) {
      setRunning(true);
    }

    setGameState(newGameState);
  }

  function gameLoop(ctx: CanvasRenderingContext2D) {
    if (!running) {
      return;
    }

    let { x, y } = gameState.snake.body[0];

    // Colision with food
    if (x === gameState.food.x && y === gameState.food.y) {
      growSnake();
      let newGameState = { ...gameState };
      generateFood(newGameState);
      setGameState(newGameState);
    }

    // Colision with wall
    if (x >= WIDTH || x < 0 || y >= HEIGHT || y < 0) {
      // Not sure what to do when finished
      setRunning(false);
      return;
    }

    // Colision with self
    if (
      gameState.snake.body
        .slice(1)
        .some((node) => node === gameState.snake.body[0])
    ) {
      // Not sure what to do when finished
      setRunning(false);
      return;
    }

    // Move snake
    let newGameState = { ...gameState };
    let { direction, body } = newGameState.snake;
    let { x: headX, y: headY } = body[0];

    switch (direction) {
      case 'up': {
        body.unshift({ x: headX, y: headY - 1 });
        break;
      }
      case 'down': {
        body.unshift({ x: headX, y: headY + 1 });
        break;
      }
      case 'left': {
        body.unshift({ x: headX - 1, y: headY });
        break;
      }
      case 'right': {
        body.unshift({ x: headX + 1, y: headY });
        break;
      }
      default:
        break;
    }
    body.pop();
    setGameState(newGameState);

    drawGame(ctx);
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    const canvas = canvasRef.current as HTMLCanvasElement;
    const ctx = canvas?.getContext('2d') as CanvasRenderingContext2D;
    onNewGame();
    drawGame(ctx);
  }, []);

  useInterval(() => {
    if (running) {
      const canvas = canvasRef.current as HTMLCanvasElement;
      const ctx = canvas?.getContext('2d') as CanvasRenderingContext2D;
      gameLoop(ctx);
    }
  }, DELAY);

  let canvasStyle = {
    border: '1px solid black',
  };

  let containerStye = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  return (
    <div style={containerStye}>
      <canvas
        id="canvas"
        ref={canvasRef}
        width={WIDTH * SCALE_FACTOR}
        height={HEIGHT * SCALE_FACTOR}
        style={canvasStyle}
      ></canvas>
      <h1>Score: {score}</h1>
    </div>
  );
}

// TODO: Add game over screen
// TODO: Add pause
// TODO: Persist high score and score history
// TODO: Split to more files
