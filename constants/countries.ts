export type CountryOption = {
  code: string;
  name: string;
  flag: string;
  timezones: string[];
};

function flagFromCode(code: string): string {
  return code
    .toUpperCase()
    .replace(/./g, (char) =>
      String.fromCodePoint(127397 + char.charCodeAt(0)),
    );
}

const RAW_COUNTRIES: Array<{
  code: string;
  name: string;
  timezones: string[];
}> = [
  { code: "AF", name: "Afghanistan", timezones: ["Asia/Kabul"] },
  { code: "AL", name: "Albania", timezones: ["Europe/Tirane"] },
  { code: "DZ", name: "Algeria", timezones: ["Africa/Algiers"] },
  { code: "AR", name: "Argentina", timezones: ["America/Argentina/Buenos_Aires"] },
  { code: "AM", name: "Armenia", timezones: ["Asia/Yerevan"] },
  { code: "AU", name: "Australia", timezones: ["Australia/Sydney", "Australia/Melbourne", "Australia/Brisbane", "Australia/Perth", "Australia/Adelaide", "Australia/Darwin", "Australia/Hobart"] },
  { code: "AT", name: "Austria", timezones: ["Europe/Vienna"] },
  { code: "AZ", name: "Azerbaijan", timezones: ["Asia/Baku"] },
  { code: "BH", name: "Bahrain", timezones: ["Asia/Bahrain"] },
  { code: "BD", name: "Bangladesh", timezones: ["Asia/Dhaka"] },
  { code: "BY", name: "Belarus", timezones: ["Europe/Minsk"] },
  { code: "BE", name: "Belgium", timezones: ["Europe/Brussels"] },
  { code: "BJ", name: "Benin", timezones: ["Africa/Porto-Novo"] },
  { code: "BO", name: "Bolivia", timezones: ["America/La_Paz"] },
  { code: "BA", name: "Bosnia and Herzegovina", timezones: ["Europe/Sarajevo"] },
  { code: "BW", name: "Botswana", timezones: ["Africa/Gaborone"] },
  { code: "BR", name: "Brazil", timezones: ["America/Sao_Paulo", "America/Manaus", "America/Fortaleza", "America/Recife", "America/Belem", "America/Cuiaba", "America/Porto_Velho", "America/Rio_Branco"] },
  { code: "BN", name: "Brunei", timezones: ["Asia/Brunei"] },
  { code: "BG", name: "Bulgaria", timezones: ["Europe/Sofia"] },
  { code: "BF", name: "Burkina Faso", timezones: ["Africa/Ouagadougou"] },
  { code: "KH", name: "Cambodia", timezones: ["Asia/Phnom_Penh"] },
  { code: "CM", name: "Cameroon", timezones: ["Africa/Douala"] },
  { code: "CA", name: "Canada", timezones: ["America/Toronto", "America/Vancouver", "America/Edmonton", "America/Winnipeg", "America/Halifax", "America/St_Johns", "America/Whitehorse", "America/Yellowknife"] },
  { code: "CL", name: "Chile", timezones: ["America/Santiago", "Pacific/Easter"] },
  { code: "CN", name: "China", timezones: ["Asia/Shanghai", "Asia/Urumqi"] },
  { code: "CO", name: "Colombia", timezones: ["America/Bogota"] },
  { code: "CR", name: "Costa Rica", timezones: ["America/Costa_Rica"] },
  { code: "HR", name: "Croatia", timezones: ["Europe/Zagreb"] },
  { code: "CU", name: "Cuba", timezones: ["America/Havana"] },
  { code: "CY", name: "Cyprus", timezones: ["Asia/Nicosia"] },
  { code: "CZ", name: "Czechia", timezones: ["Europe/Prague"] },
  { code: "CD", name: "DR Congo", timezones: ["Africa/Kinshasa", "Africa/Lubumbashi"] },
  { code: "DK", name: "Denmark", timezones: ["Europe/Copenhagen"] },
  { code: "DO", name: "Dominican Republic", timezones: ["America/Santo_Domingo"] },
  { code: "EC", name: "Ecuador", timezones: ["America/Guayaquil", "Pacific/Galapagos"] },
  { code: "EG", name: "Egypt", timezones: ["Africa/Cairo"] },
  { code: "SV", name: "El Salvador", timezones: ["America/El_Salvador"] },
  { code: "EE", name: "Estonia", timezones: ["Europe/Tallinn"] },
  { code: "ET", name: "Ethiopia", timezones: ["Africa/Addis_Ababa"] },
  { code: "FI", name: "Finland", timezones: ["Europe/Helsinki"] },
  { code: "FR", name: "France", timezones: ["Europe/Paris"] },
  { code: "GE", name: "Georgia", timezones: ["Asia/Tbilisi"] },
  { code: "DE", name: "Germany", timezones: ["Europe/Berlin"] },
  { code: "GH", name: "Ghana", timezones: ["Africa/Accra"] },
  { code: "GR", name: "Greece", timezones: ["Europe/Athens"] },
  { code: "GT", name: "Guatemala", timezones: ["America/Guatemala"] },
  { code: "HN", name: "Honduras", timezones: ["America/Tegucigalpa"] },
  { code: "HK", name: "Hong Kong", timezones: ["Asia/Hong_Kong"] },
  { code: "HU", name: "Hungary", timezones: ["Europe/Budapest"] },
  { code: "IS", name: "Iceland", timezones: ["Atlantic/Reykjavik"] },
  { code: "IN", name: "India", timezones: ["Asia/Kolkata"] },
  { code: "ID", name: "Indonesia", timezones: ["Asia/Jakarta", "Asia/Makassar", "Asia/Jayapura", "Asia/Pontianak"] },
  { code: "IR", name: "Iran", timezones: ["Asia/Tehran"] },
  { code: "IQ", name: "Iraq", timezones: ["Asia/Baghdad"] },
  { code: "IE", name: "Ireland", timezones: ["Europe/Dublin"] },
  { code: "IL", name: "Israel", timezones: ["Asia/Jerusalem"] },
  { code: "IT", name: "Italy", timezones: ["Europe/Rome"] },
  { code: "CI", name: "Ivory Coast", timezones: ["Africa/Abidjan"] },
  { code: "JM", name: "Jamaica", timezones: ["America/Jamaica"] },
  { code: "JP", name: "Japan", timezones: ["Asia/Tokyo"] },
  { code: "JO", name: "Jordan", timezones: ["Asia/Amman"] },
  { code: "KZ", name: "Kazakhstan", timezones: ["Asia/Almaty", "Asia/Aqtobe"] },
  { code: "KE", name: "Kenya", timezones: ["Africa/Nairobi"] },
  { code: "KW", name: "Kuwait", timezones: ["Asia/Kuwait"] },
  { code: "LV", name: "Latvia", timezones: ["Europe/Riga"] },
  { code: "LB", name: "Lebanon", timezones: ["Asia/Beirut"] },
  { code: "LY", name: "Libya", timezones: ["Africa/Tripoli"] },
  { code: "LT", name: "Lithuania", timezones: ["Europe/Vilnius"] },
  { code: "LU", name: "Luxembourg", timezones: ["Europe/Luxembourg"] },
  { code: "MO", name: "Macau", timezones: ["Asia/Macau"] },
  { code: "MG", name: "Madagascar", timezones: ["Indian/Antananarivo"] },
  { code: "MY", name: "Malaysia", timezones: ["Asia/Kuala_Lumpur"] },
  { code: "MT", name: "Malta", timezones: ["Europe/Malta"] },
  { code: "MX", name: "Mexico", timezones: ["America/Mexico_City", "America/Tijuana", "America/Cancun", "America/Monterrey", "America/Chihuahua", "America/Hermosillo"] },
  { code: "MD", name: "Moldova", timezones: ["Europe/Chisinau"] },
  { code: "MN", name: "Mongolia", timezones: ["Asia/Ulaanbaatar"] },
  { code: "MA", name: "Morocco", timezones: ["Africa/Casablanca"] },
  { code: "MZ", name: "Mozambique", timezones: ["Africa/Maputo"] },
  { code: "MM", name: "Myanmar", timezones: ["Asia/Yangon"] },
  { code: "NA", name: "Namibia", timezones: ["Africa/Windhoek"] },
  { code: "NP", name: "Nepal", timezones: ["Asia/Kathmandu"] },
  { code: "NL", name: "Netherlands", timezones: ["Europe/Amsterdam"] },
  { code: "NZ", name: "New Zealand", timezones: ["Pacific/Auckland", "Pacific/Chatham"] },
  { code: "NI", name: "Nicaragua", timezones: ["America/Managua"] },
  { code: "NE", name: "Niger", timezones: ["Africa/Niamey"] },
  { code: "NG", name: "Nigeria", timezones: ["Africa/Lagos"] },
  { code: "MK", name: "North Macedonia", timezones: ["Europe/Skopje"] },
  { code: "NO", name: "Norway", timezones: ["Europe/Oslo"] },
  { code: "OM", name: "Oman", timezones: ["Asia/Muscat"] },
  { code: "PK", name: "Pakistan", timezones: ["Asia/Karachi"] },
  { code: "PA", name: "Panama", timezones: ["America/Panama"] },
  { code: "PY", name: "Paraguay", timezones: ["America/Asuncion"] },
  { code: "PE", name: "Peru", timezones: ["America/Lima"] },
  { code: "PH", name: "Philippines", timezones: ["Asia/Manila"] },
  { code: "PL", name: "Poland", timezones: ["Europe/Warsaw"] },
  { code: "PT", name: "Portugal", timezones: ["Europe/Lisbon", "Atlantic/Madeira", "Atlantic/Azores"] },
  { code: "QA", name: "Qatar", timezones: ["Asia/Qatar"] },
  { code: "RO", name: "Romania", timezones: ["Europe/Bucharest"] },
  { code: "RU", name: "Russia", timezones: ["Europe/Moscow", "Europe/Kaliningrad", "Asia/Yekaterinburg", "Asia/Novosibirsk", "Asia/Krasnoyarsk", "Asia/Irkutsk", "Asia/Yakutsk", "Asia/Vladivostok", "Asia/Magadan", "Asia/Kamchatka"] },
  { code: "RW", name: "Rwanda", timezones: ["Africa/Kigali"] },
  { code: "SA", name: "Saudi Arabia", timezones: ["Asia/Riyadh"] },
  { code: "SN", name: "Senegal", timezones: ["Africa/Dakar"] },
  { code: "RS", name: "Serbia", timezones: ["Europe/Belgrade"] },
  { code: "SG", name: "Singapore", timezones: ["Asia/Singapore"] },
  { code: "SK", name: "Slovakia", timezones: ["Europe/Bratislava"] },
  { code: "SI", name: "Slovenia", timezones: ["Europe/Ljubljana"] },
  { code: "ZA", name: "South Africa", timezones: ["Africa/Johannesburg"] },
  { code: "KR", name: "South Korea", timezones: ["Asia/Seoul"] },
  { code: "ES", name: "Spain", timezones: ["Europe/Madrid", "Atlantic/Canary"] },
  { code: "LK", name: "Sri Lanka", timezones: ["Asia/Colombo"] },
  { code: "SE", name: "Sweden", timezones: ["Europe/Stockholm"] },
  { code: "CH", name: "Switzerland", timezones: ["Europe/Zurich"] },
  { code: "TW", name: "Taiwan", timezones: ["Asia/Taipei"] },
  { code: "TZ", name: "Tanzania", timezones: ["Africa/Dar_es_Salaam"] },
  { code: "TH", name: "Thailand", timezones: ["Asia/Bangkok"] },
  { code: "TN", name: "Tunisia", timezones: ["Africa/Tunis"] },
  { code: "TR", name: "Turkey", timezones: ["Europe/Istanbul"] },
  { code: "UG", name: "Uganda", timezones: ["Africa/Kampala"] },
  { code: "UA", name: "Ukraine", timezones: ["Europe/Kyiv"] },
  { code: "AE", name: "United Arab Emirates", timezones: ["Asia/Dubai"] },
  { code: "GB", name: "United Kingdom", timezones: ["Europe/London"] },
  { code: "US", name: "United States", timezones: ["America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "America/Anchorage", "Pacific/Honolulu", "America/Phoenix", "America/Puerto_Rico"] },
  { code: "UY", name: "Uruguay", timezones: ["America/Montevideo"] },
  { code: "UZ", name: "Uzbekistan", timezones: ["Asia/Tashkent"] },
  { code: "VE", name: "Venezuela", timezones: ["America/Caracas"] },
  { code: "VN", name: "Vietnam", timezones: ["Asia/Ho_Chi_Minh"] },
  { code: "ZM", name: "Zambia", timezones: ["Africa/Lusaka"] },
  { code: "ZW", name: "Zimbabwe", timezones: ["Africa/Harare"] },
];

export const COUNTRIES: CountryOption[] = RAW_COUNTRIES.map((country) => ({
  ...country,
  flag: flagFromCode(country.code),
})).sort((a, b) => a.name.localeCompare(b.name));

export function findCountryByName(name: string): CountryOption | undefined {
  const normalized = name.trim().toLowerCase();
  if (!normalized) return undefined;
  return COUNTRIES.find((country) => country.name.toLowerCase() === normalized);
}

export function findCountryByCode(code: string): CountryOption | undefined {
  return COUNTRIES.find(
    (country) => country.code.toLowerCase() === code.trim().toLowerCase(),
  );
}

export function getTimezonesForCountry(
  country: CountryOption | undefined,
): string[] {
  if (!country?.timezones?.length) return ["UTC"];
  return country.timezones;
}

export function formatTimezoneLabel(timezone: string): string {
  try {
    const now = new Date();
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "shortOffset",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(now);
    const offset =
      parts.find((part) => part.type === "timeZoneName")?.value || "";
    return offset ? `${timezone.replace(/_/g, " ")} (${offset})` : timezone;
  } catch {
    return timezone;
  }
}
