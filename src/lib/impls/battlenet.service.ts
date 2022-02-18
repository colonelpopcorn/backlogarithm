import { Observable } from "rxjs";
import { GameFetcher } from "../interfaces/game-fetcher";
import { Game } from "../interfaces/game-types";

export class BattleNetService implements GameFetcher {
  authorize(): Observable<String> {
    throw new Error("Method not implemented.");
  }
  getOwnedGames(): Observable<Game[]> {
    throw new Error("Method not implemented.");
  }
}
