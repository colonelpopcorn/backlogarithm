import { Axios } from "axios";
import { from, map, Observable, of } from "rxjs";
import { GameFetcher } from "../interfaces/game-fetcher";
import { SteamGame } from "../interfaces/game-types";

export class SteamService implements GameFetcher {
  private readonly STEAM_API_KEY: string;
  constructor(
    private httpService: Axios,
    private readonly apiKey: string,
    private readonly steamId: string
  ) {
    this.STEAM_API_KEY = apiKey;
  }

  setAccessToken(_: string): void {
      
  }

  authorize(): Observable<String> {
    return of(this.apiKey);
  }

  getOwnedGames(): Observable<SteamGame[]> {
    const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${this.STEAM_API_KEY}&steamid=${this.steamId}&include_appinfo=true&format=json`;
    return from(this.httpService.get(url)).pipe(
      map((response) => response.data.response.games)
    );
  }
}
