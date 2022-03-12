import { Axios } from "axios";
import { filter, from, map, Observable, of, switchMap, tap } from "rxjs";

class IgdbService {
  private readonly TWITCH_CLIENT_ID;
  private readonly TWITCH_CLIENT_SECRET;
  private token: string | undefined;

  constructor(
    private httpService: Axios,
    twitchCredentials: { clientId: string; clientSecret: string }
  ) {
    this.TWITCH_CLIENT_ID = twitchCredentials.clientId;
    this.TWITCH_CLIENT_SECRET = twitchCredentials.clientSecret;
  }
  setAccessToken(token: string): void {
    this.token = token;
  }

  authorize(): Observable<string> {
    const twitchTokenUrl = `https://id.twitch.tv/oauth2/token?client_id=${this.TWITCH_CLIENT_ID}&client_secret=${this.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`;
    return from(this.httpService.post(twitchTokenUrl)).pipe(
      map((response) => response.data.access_token)
    );
  }

  searchByGameName(gameName: string): Observable<any> {
    const twitchApiUrl = "https://api.igdb.com/v4/games";
    const headers = {
      "Client-ID": this.TWITCH_CLIENT_ID,
      Authorization: `Bearer ${this.token}`,
      Accept: "application/json",
    };
    return from(
      this.httpService.post(twitchApiUrl, `search "${gameName}"; fields *;`, {
        headers,
      })
    ).pipe(
      // tap((res) => console.log(res.data)),
      map((res) =>
        res.data.length > 1
          ? res.data.find((el: any) => {
              let nameStrippedOfSpecialCharacters = el.name
                .toLowerCase()
                .replace("/:/", "")
                .replace("/-/", "")
                .replace("/&/", "and");
              return nameStrippedOfSpecialCharacters.includes(
                gameName.toLowerCase()
              );
            })
          : res.data[0]
      )
    );
  }

  getOwnedGames(): Observable<any[]> {
    throw new Error("Method not implemented.");
  }
}

export class GogService {
  private token: string | undefined;
  constructor(private httpService: Axios, private readonly cookie: string) {}
  setAccessToken(token: string): void {
    this.token = token;
  }

  authorize(): Observable<string> {
    const authUrl = `https://api.gog.com/user/accessToken.json`;
    return from(
      this.httpService.post(authUrl, null, { headers: { Cookie: this.cookie } })
    ).pipe(map((res) => res.data.accessToken));
  }

  getOwnedGames(): Observable<any[]> {
    const someUrl = "https://gog.com/account/getFilteredProducts?mediaType=1";
    return from(
      this.httpService.post(someUrl, null, { headers: { Cookie: this.cookie } })
    ).pipe(map((res) => res.data));
  }

  searchByGameId(gogGameId: string): Observable<any> {
    const url = `https://embed.gog.com/account/gameDetails/${gogGameId}.json`;
    return from(
      this.httpService.get(url, { headers: { Cookie: this.cookie } })
    ).pipe(map((res) => res.data));
  }

  getOwnedGameIds(): Observable<String[]> {
    const url = `https://menu.gog.com/v1/account/licences`;
    return from(
      this.httpService.get(url, { headers: { Cookie: this.cookie } })
    ).pipe(map((res) => res.data));
  }
}

class SteamService {
  private readonly STEAM_API_KEY: string;
  constructor(
    private httpService: Axios,
    private readonly apiKey: string,
    private readonly steamId: string
  ) {
    this.STEAM_API_KEY = apiKey;
  }

  setAccessToken(_: string): void {}

  authorize(): Observable<String> {
    return of(this.apiKey);
  }

  getOwnedGames(): Observable<any[]> {
    const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${this.STEAM_API_KEY}&steamid=${this.steamId}&include_appinfo=true&format=json`;
    return from(this.httpService.get(url)).pipe(
      map((response) => response.data.response.games)
    );
  }
}

const fetchGamesFromAllServices = () => {
  console.log("hello world!")
}

fetchGamesFromAllServices();
