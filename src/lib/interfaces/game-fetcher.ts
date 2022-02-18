import { Observable } from "rxjs";
import { Game } from "./game-types";

export interface GameFetcher {
    authorize(): Observable<String>;
    getOwnedGames(): Observable<Game[]>
};

