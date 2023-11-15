import { Game } from '@prisma/client';
import { getApiUrl } from '../app/api/helpers';

export default async function fetchCurrentGame() {
  const res = await fetch(getApiUrl('/current-game'));
  const gameInfo: Game = await res.json();
  return gameInfo;
}
