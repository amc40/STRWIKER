'use server'
import { revalidatePath } from "next/cache";
import { getApiUrl } from "../app/api/helpers";
import { $Enums } from "@prisma/client";
import fetchCurrentGame from "./fetchCurrentGame";
import prisma from "./planetscale";

export async function addTodo(data: FormData) {
    const title = data.get("title");
    await fetch(getApiUrl("/test"), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userId: 33, title, complete: false,
        })
    })

    revalidatePath('/current-game');
}

export async function addPlayerToCurrentGame(playerId: number, team: $Enums.Team) {
    const currentGame = await fetchCurrentGame();
    if(currentGame.currentPointId === null) {
        throw new Error("current point id is null");
    }
    await prisma.playerPoint.create({
        data: {
            ownGoal: false,
            position: 0,
            rattled: false,
            scoredGoal: false,
            team,
            playerId,
            pointId: currentGame.currentPointId,

        }
    })

    revalidatePath('/current-game');
}