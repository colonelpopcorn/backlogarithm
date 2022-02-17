import { Axios } from "axios";
import { from, map, Observable, switchMap, tap } from "rxjs";
import { IgdbGame } from "./igdb-game.interface";

export class IgdbService {
  private readonly TWITCH_CLIENT_ID;
  private readonly TWITCH_CLIENT_SECRET;

  constructor(private httpService: Axios, private twitchCredentials: {clientId: string, clientSecret: string}) {
    this.TWITCH_CLIENT_ID = twitchCredentials.clientId;
    this.TWITCH_CLIENT_SECRET = twitchCredentials.clientSecret;
  }

  authorize(): Observable<string> {
    const twitchTokenUrl = `https://id.twitch.tv/oauth2/token?client_id=${this.TWITCH_CLIENT_ID}&client_secret=${this.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`;
    return from(this.httpService.post(twitchTokenUrl)).pipe(
      map((response) => response.data.access_token)
    );
  }

  searchByGameName(gameName: string): Observable<any> {
    return this.authorize().pipe(
      switchMap((accessToken) => {
        const twitchApiUrl = "https://api.igdb.com/v4/games";
        const headers = {
          "Client-ID": this.TWITCH_CLIENT_ID,
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        };
        return from(
          this.httpService.post(
            twitchApiUrl,
            `fields *; where name = "${gameName}"*;`,
            {
              headers,
            }
          )
        ).pipe(map((res) => res.data));
      })
    );
  }
}
