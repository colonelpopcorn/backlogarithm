import axios, { Axios } from "axios";
import { HowLongToBeatService, HowLongToBeatEntry } from "howlongtobeat";
import Knex from "knex";
import { writeFileSync } from "fs";
import {
  concatAll,
  concatMap,
  finalize,
  from,
  lastValueFrom,
  map,
  mergeAll,
  mergeMap,
  Observable,
  of,
  scan,
  switchMap,
  tap,
  throwError,
  timer,
} from "rxjs";
const config = require("./knexfile");

type StoreFront = "Steam" | "GOG" | "ORIGIN" | "EPIC" | "BATTLENET" | "UBISOFT";
interface Game {
  name: string;
  storeId?: string;
  storeFront?: StoreFront;
  timePlayedInMinutes?: number;
  igdbGameId?: string;
  releaseDate?: number;
  criticRating?: number;
  communityRating?: number;
  ownedStatus?: string;
  playedStatus?: string;
  completedStatus?: string;
  minutesPlayed?: number;
  tierRanking?: "S" | "A" | "B" | "C" | "D" | "F";
  genre?: string;
  howLongToBeatMin?: number;
  howLongToBeatMid?: number;
  howLongToBeatMax?: number;
}

const nonASCIIPattern = /[^\x00-\x7F]+\ *(?:[^\x00-\x7F]| )*/g;
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

  searchByGameName(game: Game): Observable<any> {
    const twitchApiUrl = "https://api.igdb.com/v4/games";
    const headers = {
      "Client-ID": this.TWITCH_CLIENT_ID,
      Authorization: `Bearer ${this.token}`,
      Accept: "application/json",
    };
    return from(
      this.httpService.post(
        twitchApiUrl,
        `search "${game.name}"; fields id,aggregated_rating,genres,name,rating,first_release_date;`,
        {
          headers,
        }
      )
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
                game.name.toLowerCase()
              );
            })
          : res.data[0] === undefined
          ? { ...game }
          : res.data[0]
      )
      // tap((game) => console.log(game.name)),
      // retryWhen(
      //   genericRetryStrategy({
      //     scalingDuration: 4000,
      //     maxRetryAttempts: 5,
      //   })
      // )
    );
  }

  searchByGameNameV2(game: Game): Observable<any> {
    const twitchApiUrl = "https://api.igdb.com/v4/games";
    const headers = {
      "Client-ID": this.TWITCH_CLIENT_ID,
      Authorization: `Bearer ${this.token}`,
      Accept: "application/json",
    };
    const gameNameSearchTerm = (game.name as any).replaceAll(
      nonASCIIPattern,
      ""
    );
    return from(
      this.httpService.post(
        twitchApiUrl,
        `search "${gameNameSearchTerm}"; fields id,aggregated_rating,genres,name,rating,first_release_date;`,
        {
          headers,
        }
      )
    );
  }

  getGenres(genreIds: string[]): Observable<any> {
    const twitchApiUrl = "https://api.igdb.com/v4/genres";
    const headers = {
      "Client-ID": this.TWITCH_CLIENT_ID,
      Authorization: `Bearer ${this.token}`,
      Accept: "application/json",
    };
    return from(
      this.httpService.post(
        twitchApiUrl,
        `where id = (${genreIds.reduce(
          (prev, curr, index) =>
            index === genreIds.length - 1 || index === 0
              ? prev + curr
              : prev + ", " + curr,
          ""
        )}); fields name;`,
        {
          headers,
        }
      )
    ).pipe(
      map(({ data }) =>
        data.reduce(
          (prev: any, curr: any, index: number) =>
            index === data.length - 1
              ? prev.name + curr.name
              : prev.name + ", " + curr.name,
          { name: "" }
        )
      )
    );
  }
}
class GogService {
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
    ).pipe(map((res) => ({ gameId: gogGameId, ...res.data })));
  }

  getOwnedGameIds(): Observable<string[]> {
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

const genericRetryStrategy =
  ({
    maxRetryAttempts = 3,
    scalingDuration = 1000,
    excludedStatusCodes = [],
  }: {
    maxRetryAttempts?: number;
    scalingDuration?: number;
    excludedStatusCodes?: number[];
  } = {}) =>
  (attempts: Observable<any>) => {
    return attempts.pipe(
      mergeMap((error, i) => {
        const retryAttempt = i + 1;
        // if maximum number of retries have been met
        // or response is a status code we don't wish to retry, throw error
        if (
          retryAttempt > maxRetryAttempts ||
          excludedStatusCodes.find((e) => e === error.status)
        ) {
          console.log(error);
          return throwError(() => new Error(error));
        }
        console.log(
          `Attempt ${retryAttempt}: retrying in ${
            retryAttempt * scalingDuration
          }ms`
        );
        // retry after 1s, 2s, etc...
        return timer(retryAttempt * scalingDuration);
      }),
      finalize(() => console.log("We are done!"))
    );
  };

function fetchGamesFromGog(): Observable<any> {
  const gogService = new GogService(axios, process.env.GOG_COOKIE || "");
  const gogGames = gogService.authorize().pipe(
    tap((token) => gogService.setAccessToken(token)),
    switchMap((_) => gogService.getOwnedGameIds()),
    concatAll(),
    concatMap((gameId) => gogService.searchByGameId(gameId)),
    scan((all: any[], current: any) => [current, ...all], []),
    map((games) =>
      games.map((game) => ({
        name: game.title,
        storeId: game.gameId,
        storeFront: "GOG",
        timePlayedInMinutes: 0,
      }))
    )
  );
  return gogGames;
}

function fetchGamesFromSteam() {
  const steamService = new SteamService(
    axios,
    process.env.STEAM_API_KEY || "",
    process.env.STEAM_ID || ""
  );
  const steamGames = steamService.getOwnedGames().pipe(
    map((games) =>
      games.map((game) => ({
        name: game.name,
        storeId: game.appid,
        storeFront: "Steam",
        timePlayedInMinutes: game.playtime_forever,
      }))
    )
  );
  return steamGames;
}

const getIgdbService = () =>
  new IgdbService(axios, {
    clientId: process.env.TWITCH_CLIENT_ID || "",
    clientSecret: process.env.TWITCH_CLIENT_SECRET || "",
  });

function fetchDataForGamesFromIGDB(allGames: Game[]) {
  const igdbService = getIgdbService();

  return igdbService.authorize().pipe(
    tap((token) => igdbService.setAccessToken(token)),
    map(() => allGames),
    mergeAll(),
    mergeMap((game) => igdbService.searchByGameName(game), 4),
    scan((all: any[], current: any) => [current, ...all], [])
  );
}

const hltbService = new HowLongToBeatService();

const fetchAndWriteSteamGames = () =>
  new Promise<void>(async (resolve) => {
    console.log("Fetching games from Steam...");
    const steamGames = await lastValueFrom(fetchGamesFromSteam());
    console.log("Writing Steam games to disk...");
    writeFileSync(
      "./workbench/steam_games.json",
      JSON.stringify(steamGames, null, 2)
    );
    resolve();
  });
const fetchAndWriteGogGames = () =>
  new Promise<void>(async (resolve) => {
    console.log("Fetching games from GOG...");
    const gogGames = await lastValueFrom(fetchGamesFromGog());
    console.log("Writing GOG games to disk...");
    writeFileSync(
      "./workbench/gog_games.json",
      JSON.stringify(gogGames, null, 2)
    );
    resolve();
  });

const insertFromFiles = (...filePaths: string[]) =>
  new Promise<void>(async (resolve) => {
    const initialGames = [];
    for (const filePath of filePaths) {
      const content = require(filePath);
      initialGames.push(content);
    }
    console.log(initialGames);
    const allGames = initialGames
      .flat()
      .filter((game: any) => game.name !== undefined);
    console.log(allGames);
    const igdbService = getIgdbService();
    await lastValueFrom(
      igdbService
        .authorize()
        .pipe(tap((token) => igdbService.setAccessToken(token)))
    );

    const knex = Knex(config.development);
    const gamesThatDidntMakeIt = [];

    for (const game of allGames) {
      const res = await lastValueFrom(igdbService.searchByGameNameV2(game));
      if (res.error) {
        console.log("Booo");
        console.log(res.error);
      } else {
        const newGame =
          res.data.length === 1
            ? { ...game, ...res.data[0] }
            : res.data
                .filter((igdbGame: any) => {
                  const gameNameSearchTerm =
                    game.name.replaceAll(nonASCIIPattern);
                  const incomingGameName = igdbGame.name.replaceAll(
                    nonASCIIPattern,
                    ""
                  );
                  console.log(
                    `${gameNameSearchTerm} does not match ${incomingGameName}`
                  );
                  return (
                    gameNameSearchTerm.length === incomingGameName.length &&
                    incomingGameName.includes(gameNameSearchTerm)
                  );
                })
                .map((newIgdb: any) => ({ ...newIgdb, ...game }))[0];
        let genreString = "";
        try {
          if (newGame.genres) {
            genreString = await lastValueFrom(
              igdbService.getGenres(newGame.genres)
            );
          }
          const hltbData = await hltbService.search(game.name);
          const result = hltbData.sort((a, b) => b.similarity - a.similarity);
          const releaseDate = newGame.first_release_date
            ? new Date(newGame.first_release_date * 1000)
            : new Date("01 Jan 1970 00:00:00 GMT");
          const insertObj = {
            game_name: newGame.name,
            store_id: newGame.storeId,
            store_front: newGame.storeFront,
            igdb_game_id: newGame.id,
            release_date: releaseDate,
            critic_rating: Math.floor(newGame.aggregated_rating || 0),
            community_rating: Math.floor(newGame.rating || 0),
            minutes_played: newGame.timePlayedInMinutes,
            genre: genreString,
            how_long_to_beat_min: result[0] ? result[0].gameplayMain : 0,
            how_long_to_beat_mid: result[0] ? result[0].gameplayMainExtra : 0,
            how_long_to_beat_max: result[0]
              ? result[0].gameplayCompletionist
              : 0,
          };
          console.log(insertObj);
          await knex("games").insert(insertObj);
        } catch (e) {
          console.log(e);
          gamesThatDidntMakeIt.push(game);
        }
      }
    }
    writeFileSync(
      "./workbench/games_that_didnt_make_it.json",
      JSON.stringify(gamesThatDidntMakeIt, null, 2)
    );
    resolve();
  }).then(() => console.log("Done!"));

const fetchGamesNotInDb = (storeFront: StoreFront) =>
  new Promise<void>(async (resolve) => {
    const fileName =
      storeFront === "Steam"
        ? "./workbench/steam_games.json"
        : storeFront === "GOG"
        ? "./workbench/gog_games.json"
        : new Error("not implemented yet!");
    if (typeof fileName !== "string") {
      throw fileName;
    }
    const rawGames = require(fileName);
    const knex = Knex(config.development);
    const games = await knex("games")
      .select("store_id")
      .where("store_front", storeFront);
    const gamesInDb = games.map((x) => x.store_id);
    let gamesNotInDb = rawGames.filter(
      (game: Game) =>
        gamesInDb.indexOf(
          game.storeId === undefined ? "" : game.storeId.toString()
        ) === -1
    );
    const newFileName = fileName.replace(".json", "_that_didnt_make_it.json");
    writeFileSync(newFileName, JSON.stringify(gamesNotInDb, null, 2));
    resolve();
    return;
  });

  const someFunc = () => new Promise(resolve => setTimeout(resolve, 4000))

// fetchAndWriteSteamGames().then(() => console.log("done"));
// fetchGamesNotInDb("GOG").then(() => console.log("done"));
// fetchGamesNotInDb("Steam").then(() => console.log("done"));
// console.log("Derp");
// someFunc().then(() => console.log("Derp is done."))
// insertFromFiles(
//   "./workbench/gog_games_that_didnt_make_it.json",
//   "./workbench/steam_games_that_didnt_make_it.json"
// ).then(() => console.log("done"));
