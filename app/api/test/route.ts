import { Todo } from "@prisma/client";
import prisma from "../../../lib/planetscale";

type RequestData = {
  userId: number,
  title: string,
  complete: boolean,
};

type ResponseData = Todo;

export const POST = async function handler(req: Request) {
  const player = await prisma.todo.create({
    data: (await req.json()) as RequestData
  });

  return Response.json(player as ResponseData);
};

export const GET = async function handler(req: Request) {
  const players = await prisma.todo.findMany();
  return Response.json(players as Todo[]);
};
