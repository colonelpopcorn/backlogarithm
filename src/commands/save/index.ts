import { Command, Flags } from "@oclif/core";
import axios from "axios";
import { firstValueFrom, of } from "rxjs";
import { GogService } from "../../lib/impls/gog.service";
import { SteamService } from "../../lib/impls/steam.service";
import { GameFetcher } from "../../lib/interfaces/game-fetcher";

export default class GetGames extends Command {
  static description = "Get games from various APIs";

  static examples = [
    `$ oex get steam -i <some-id>
Fetched 169 steam games and saved them to steam-games.json!
`,
  ];

  static flags = {
    steamId: Flags.string({
      char: "i",
      description: "Steam ID to fetch games for.",
      required: false,
    }),
  };

  static args = [
    {
      name: "service",
      description: "Service to fetch games from",
      required: true,
    },
  ];

  async run(): Promise<void> {
    const { args, flags } = await this.parse(GetGames);
    const service = this._getServiceFromArgument(args.service, flags);
    firstValueFrom(service.getOwnedGames()).then((games) => {
      this.log(JSON.stringify(games, null, 2));
    });
  }

  private _getServiceFromArgument(
    serviceName: string,
    flags: any
  ): GameFetcher {
    switch (true) {
      case serviceName.toLowerCase() === "steam":
        return new SteamService(
          axios,
          process.env.STEAM_API_KEY || "",
          flags.steamId
        );
      case serviceName.toLowerCase() === "gog":
        return new GogService(axios, process.env.GOG_COOKIE || "");
      default:
        return { getOwnedGames: () => of([]), authorize: () => of(""), setAccessToken: _ => void 0 };
    }
  }
}
