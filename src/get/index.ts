import {Command} from '@oclif/core'
import axios from 'axios'
import { SteamService } from '../lib/steam/steam.service'

export default class GetGames extends Command {
  static description = 'Say hello'

  static examples = [
    `$ oex get steam
Fetched 169 steam games and saved them to steam-games.json!
`,
  ]

  static flags = {
  }

  static args = [{name: 'service', description: 'Service to fetch games from', required: true}]

  async run(): Promise<void> {
    const {args, flags} = await this.parse(GetGames)

    this.log(`hello ${args.person} from ${flags.from}! (./src/commands/hello/index.ts)`)
  }

  private _getServiceFromArgument(serviceName: string): GameFetcher {
      switch(true) {
          case serviceName.toLowerCase() === 'steam':
              return new SteamService(axios, process.env.STEAM_API_KEY || "");
          default:
            return null;
      }
  }
}
