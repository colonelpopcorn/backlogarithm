import { Axios } from "axios";
import { Observable, of, map, from } from "rxjs";
import { GOGGame } from "./gog-game.interface";

export class GogService {
  private readonly COOKIE;

  constructor(private httpService: Axios) {
    console.log(process.env);
    this.COOKIE = process.env.GOG_COOKIE || "";
  }

  getAccessToken(): Observable<string> {
    const authUrl = `https://api.gog.com/user/accessToken.json`;
    return from(
      this.httpService.post(authUrl, null, { headers: { Cookie: this.COOKIE } })
    ).pipe(map((res) => res.data.accessToken));
  }

  getOwnedGames(): Observable<GOGGame[]> {
    return of([{}]);
  }

  private getOwnedGameIds(): Observable<number[]> {
    return of([]);
  }
}
