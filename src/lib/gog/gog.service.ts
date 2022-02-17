import { Axios } from "axios";
import { Observable, of, map, from } from "rxjs";
import { GOGGame } from "./gog-game.interface";

export class GogService {
  constructor(private httpService: Axios, private readonly cookie: string) {}

  getAccessToken(): Observable<string> {
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
