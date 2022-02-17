import { Observable } from "rxjs";
import { Game, GameFetcher } from "../interfaces/game-fetcher";

export class OriginService implements GameFetcher {
    authorize(): Observable<String> {
        throw new Error("Method not implemented.");
    }
    getOwnedGames(): Observable<Game[]> {
        throw new Error("Method not implemented.");
    }

}