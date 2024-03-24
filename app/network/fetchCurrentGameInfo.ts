import { StatusCodes } from 'http-status-codes';
import { GameInfo } from '../view/CurrentGameInfo';
import { getBaseUrl } from './getBaseUrl';

export const fetchCurrentGameInfo = async (revalidateMs?: number) => {
  const res = await fetch(`${getBaseUrl()}/api/game/current/info`, {
    next: { revalidate: revalidateMs },
  });
  const resultText = await res.text();
  console.log('resultText', resultText);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
  if (res.status == StatusCodes.NOT_FOUND) {
    return null;
  }
  return (await JSON.parse(resultText)) as GameInfo;
};
