import { Observable } from "rxjs";
import { GOGGame } from "./gog-game.interface";
import { IgdbGame } from "./igdb-game.interface";
import { SteamGame } from "./steam-game.interface";

export interface GameFetcher {
    authorize(): Observable<String>;
    getOwnedGames(): Observable<Game[]>
};

export type Game = GOGGame | SteamGame | IgdbGame;