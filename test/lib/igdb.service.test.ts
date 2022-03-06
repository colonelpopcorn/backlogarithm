import axios from "axios";
import { expect } from "chai";
import { firstValueFrom } from "rxjs";
import { IgdbService } from "../../src/lib/impls/igdb.service";

describe("IgdbService", () => {
  const credentials = {
    clientId: process.env.TWITCH_CLIENT_ID || "",
    clientSecret: process.env.TWITCH_CLIENT_SECRET || "",
  };
  let service: IgdbService = new IgdbService(axios, credentials);

  it("should be defined", () => {
    expect(service).to.be.ok;
  });

  it("should get a token", async () => {
    const token = await firstValueFrom(service.authorize());

    expect(token).to.be.ok;
  });

  it("should get a game", async () => {
    const game = await firstValueFrom(
      service.searchByGameName("Super Paper Mario")
    );
    expect(game).to.be.ok;
  });

  it("should insert a game", async () => {
    const game = await firstValueFrom(
      service.searchByGameName("Twisted Metal: Head-On")
    );
    expect(game).to.be.ok;
  });
});
