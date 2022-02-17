import { GogService } from '../../src/lib/impls/gog.service';
import { firstValueFrom } from 'rxjs';
import { expect } from 'chai';
import axios from 'axios';

describe('GogService', () => {
  let cookie = process.env.GOG_COOKIE || "";
  let service: GogService = new GogService(axios, cookie);

  it('should be defined', () => {
    expect(service).to.be.ok;
  });

  it('should get a token', async () => {
    const token = await firstValueFrom(service.authorize());
    expect(token).to.be.ok;
  });
});
