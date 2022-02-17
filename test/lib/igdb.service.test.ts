import axios from 'axios';
import { expect } from 'chai';
import { firstValueFrom } from 'rxjs';
import { IgdbService } from '../../src/lib//igdb/igdb.service';


describe('IgdbService', () => {
  const credentials = {
    clientId: process.env.TWITCH_CLIENT_ID || "",
    clientSecret: process.env.TWITCH_CLIENT_SECRET || "",
  };
  let service: IgdbService = new IgdbService(axios, credentials);


  it('should be defined', () => {
    expect(service).to.be.ok;
  });

  it('should get a token', async () => {
    const token = await firstValueFrom(service.authorize());


    expect(token).to.be.ok;
  })

  it('should get games', async () => {
    const games = await firstValueFrom(service.searchByGameName("Mario"));

    const gamesStr = JSON.stringify(games, null, 2);

    expect(games).to.be.ok;
  })


});
