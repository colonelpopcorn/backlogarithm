import { GogService } from '../../src/lib/gog/gog.service';
import { firstValueFrom } from 'rxjs';
import { expect } from 'chai'; mocha from 'mocha';


describe('GogService', () => {
  let service: GogService = new GogService();

  it('should be defined', () => {
    expect(service).true;
  });

  it('should get a token', async () => {
    const token = await firstValueFrom(service.getAccessToken());
    logger.debug(token);
    expect(token).toBeTruthy();
  });
});
