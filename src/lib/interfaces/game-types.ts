export interface GOGGame {
  [key: string]: any;
}
export interface IgdbGame {
  [key: string]: any;
}
export interface SteamGame {
  appid: string;
  name: string;
  playtime_forever: number;
  img_icon_url: string;
  img_logo_url: string;
  playtime_windows_forever: number;
  playtime_mac_forever: number;
  playtime_linux_forever: number;
}
export interface BattleNetGame {
  [key: string]: any;
}
export interface UbisoftGame {
  [key: string]: any;
}
export interface OriginGame {
  [key: string]: any;
}
export interface EpicGame {
  [key: string]: any;
}
export type Game =
  | GOGGame
  | SteamGame
  | IgdbGame
  | BattleNetGame
  | UbisoftGame
  | OriginGame
  | EpicGame;
