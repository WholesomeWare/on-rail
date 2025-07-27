export default class Mavinform {
  static trainsUrl: string = "https://www.mavcsoport.hu/mavinform?field_modalitas_value%5B%5D=vasut";

  static get Territory() {
    return class Territory {
      private constructor(
        public readonly id: number,
        public readonly displayName: string,
        public readonly latLng: { lat: number; lng: number }
      ) {}

      static readonly BUDAPEST = new Territory(
        10868,
        "Budapest",
        { lat: 47.4979, lng: 19.0402 }
      );
      static readonly BALATON = new Territory(
        10870,
        "Balaton",
        { lat: 46.92, lng: 17.89 }
      );
      static readonly BACS_KISKUN = new Territory(
        10840,
        "Bács-Kiskun",
        { lat: 46.6, lng: 19.25 }
      );
      static readonly BARANYA = new Territory(
        10841,
        "Baranya",
        { lat: 46.0667, lng: 18.2333 }
      );
      static readonly BEKES = new Territory(
        10843,
        "Békés",
        { lat: 46.68, lng: 21.05 }
      );
      static readonly BORSOD_ABAÚJ_ZEMPLEN = new Territory(
        10844,
        "Borsod-Abaúj-Zemplén",
        { lat: 48.1, lng: 20.8 }
      );
      static readonly CSONGRAD_CSANAD = new Territory(
        10846,
        "Csongrád-Csanád",
        { lat: 46.25, lng: 20.15 }
      );
      static readonly FEJER = new Territory(
        10847,
        "Fejér",
        { lat: 47.2, lng: 18.42 }
      );
      static readonly GYOR_MOSON_SOPRON = new Territory(
        10849,
        "Győr-Moson-Sopron",
        { lat: 47.6833, lng: 17.65 }
      );
      static readonly HAJDU_BIHAR = new Territory(
        10850,
        "Hajdú-Bihar",
        { lat: 47.53, lng: 21.62 }
      );
      static readonly HEVES = new Territory(
        10852,
        "Heves",
        { lat: 47.9, lng: 20.35 }
      );
      static readonly JASZ_NAGYKUN_SZOLNOK = new Territory(
        10853,
        "Jász-Nagykun-Szolnok",
        { lat: 47.2, lng: 20.2 }
      );
      static readonly KOMAROM_ESZTERGOM = new Territory(
        10855,
        "Komárom-Esztergom",
        { lat: 47.56, lng: 18.3 }
      );
      static readonly NOGRAD = new Territory(
        10856,
        "Nógrád",
        { lat: 48, lng: 19.65 }
      );
      static readonly PEST = new Territory(
        10858,
        "Pest",
        { lat: 47.3, lng: 19.4 }
      );
      static readonly SOMOGY = new Territory(
        11046,
        "Somogy",
        { lat: 46.4, lng: 17.7 }
      );
      static readonly SZABOLCS_SZATMAR_BEREG = new Territory(
        10859,
        "Szabolcs-Szatmár-Bereg",
        { lat: 47.95, lng: 22 }
      );
      static readonly TOLNA = new Territory(
        10861,
        "Tolna",
        { lat: 46.5, lng: 18.6 }
      );
      static readonly VAS = new Territory(
        10862,
        "Vas",
        { lat: 47.25, lng: 16.75 }
      );
      static readonly VESZPREM = new Territory(
        10864,
        "Veszprém",
        { lat: 47.1, lng: 17.9 }
      );
      static readonly ZALA = new Territory(
        10865,
        "Zala",
        { lat: 46.8, lng: 16.85 }
      );

      static readonly values: Territory[] = Object.values(Territory).filter(
        (val) => val instanceof Territory
      ) as Territory[];

      public getUrl(): string {
        return `${Mavinform.trainsUrl}&field_territorial_scope_target_id%5B%5D=${this.id}`;
      }

      static fromName(name: string | null | undefined): Territory | undefined {
        if (!name) {
          return undefined;
        }
        return Territory.values.find(
          (territory) =>
            territory.displayName.toLowerCase() === name.toLowerCase()
        );
      }
    };
  }
}