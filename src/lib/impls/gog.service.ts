import { Axios } from "axios";
import { Observable, of, map, from } from "rxjs";
import { GameFetcher } from "../interfaces/game-fetcher";
import { GOGGame } from "../interfaces/gog-game.interface";

export class GogService implements GameFetcher {
  constructor(private httpService: Axios, private readonly cookie: string) {}

  authorize(): Observable<string> {
    const authUrl = `https://api.gog.com/user/accessToken.json`;
    return from(
      this.httpService.post(authUrl, null, { headers: { Cookie: this.cookie } })
    ).pipe(map((res) => res.data.accessToken));
  }

  getOwnedGames(): Observable<GOGGame[]> {
    return of([{}]);
  }

  private getOwnedGameIds(): Observable<number[]> {
    return of([]);
  }
}
