import axios from 'axios';
import { expect } from 'chai';
import { firstValueFrom } from 'rxjs';
import { SteamService } from '../../src/lib/steam/steam.service';

describe('SteamService', () => {
  let key = process.env.STEAM_API_KEY || "";
  let service: SteamService = new SteamService(axios, key);


  it('should be defined', () => {
    expect(service).to.be.ok;
  });

  it('should be able to fetch games', async () => {
    const data = await firstValueFrom(service.fetchSteamGames('76561198003008735'));

    expect(data).to.be.ok;
    expect(data.length).to.be.greaterThan(0);
  })
});
