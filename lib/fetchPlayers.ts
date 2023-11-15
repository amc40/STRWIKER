import { Player } from '@prisma/client';
import { getApiUrl } from '../app/api/helpers';

export default async function fetchPlayers() {
  const res = await fetch(getApiUrl('/players'));
  const players: Player[] = await res.json();
  return players;
}
