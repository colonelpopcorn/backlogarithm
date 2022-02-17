import { Axios } from "axios";
import { from, map, Observable } from "rxjs";
import { SteamGame } from "./steam-game.interface";

export class SteamService {
  private readonly STEAM_API_KEY: string;
  constructor(private httpService: Axios, private apiKey: string) {
    this.STEAM_API_KEY = apiKey;
  }
  fetchSteamGames(steamId: string): Observable<SteamGame[]> {
    const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${this.STEAM_API_KEY}&steamid=${steamId}&include_appinfo=true&format=json`;
    return from(this.httpService.get(url)).pipe(
      map((response) => response.data.response.games)
    );
  }
}
