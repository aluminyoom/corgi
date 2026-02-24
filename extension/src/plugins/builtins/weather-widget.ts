import { definePlugin } from '../api';
import { escapeRegex, escapeHtml } from '@/utils/strings';
import type { PluginAPI } from '../types';

const DEFAULT_EXTRA_KEYWORDS = '';
const PAGE_PATH = '/search';
const WIDGET_SELECTOR = '#weather.widget_weather';
const WIDGET_HOLDER_SELECTOR = '.widget_holder';
const DEFAULT_LOCALE = 'en-US';

const BASE_KEYWORDS = [
  'wetter',
  'wettervorhersage',
  'météo',
  'meteo',
  'tiempo',
  'clima',
  'pronóstico',
  'previsión',
  'prevision',
  'previsioni',
  'tempo',
  'previsão',
  'previsao',
  'weer',
  'weerbericht',
  'pogoda',
  'погода',
  '天気',
  '天気予報',
  '날씨',
  '天气',
  '天氣',
  'hava durumu',
  'طقس',
];

const LOCATION_ICON = `
<svg class="weather_icon_location" viewBox="0 0 24 24" aria-hidden="true">
  <path fill="currentColor" d="M12 2c-3.9 0-7 3.1-7 7 0 4.9 7 13 7 13s7-8.1 7-13c0-3.9-3.1-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
</svg>
`;

const ICON_CLEAR = `
<svg viewBox="0 0 64 64" aria-hidden="true">
  <g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="32" cy="32" r="10" />
    <line x1="32" y1="6" x2="32" y2="16" />
    <line x1="32" y1="48" x2="32" y2="58" />
    <line x1="6" y1="32" x2="16" y2="32" />
    <line x1="48" y1="32" x2="58" y2="32" />
    <line x1="14" y1="14" x2="21" y2="21" />
    <line x1="43" y1="43" x2="50" y2="50" />
    <line x1="14" y1="50" x2="21" y2="43" />
    <line x1="43" y1="21" x2="50" y2="14" />
  </g>
</svg>
`;

const ICON_CLOUDY = `
<svg viewBox="0 0 64 64" aria-hidden="true">
  <path
    d="M20 44h24a10 10 0 0 0 0-20 14 14 0 0 0-27-3A9 9 0 0 0 20 44z"
    fill="none"
    stroke="currentColor"
    stroke-width="3"
    stroke-linejoin="round"
  />
</svg>
`;

const ICON_PARTLY_CLOUDY = `
<svg viewBox="0 0 64 64" aria-hidden="true">
  <g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="22" cy="22" r="8" />
    <line x1="22" y1="6" x2="22" y2="12" />
    <line x1="22" y1="32" x2="22" y2="38" />
    <line x1="6" y1="22" x2="12" y2="22" />
    <line x1="32" y1="22" x2="38" y2="22" />
    <line x1="12" y1="12" x2="16" y2="16" />
    <line x1="28" y1="28" x2="32" y2="32" />
    <path d="M24 46h24a9 9 0 0 0 0-18 12 12 0 0 0-22-2A8 8 0 0 0 24 46z" />
  </g>
</svg>
`;

const ICON_FOG = `
<svg viewBox="0 0 64 64" aria-hidden="true">
  <g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 34h24a10 10 0 0 0 0-20 14 14 0 0 0-27-3A9 9 0 0 0 20 34z" />
    <line x1="14" y1="42" x2="50" y2="42" />
    <line x1="10" y1="50" x2="46" y2="50" />
  </g>
</svg>
`;

const ICON_DRIZZLE = `
<svg viewBox="0 0 64 64" aria-hidden="true">
  <g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 40h24a10 10 0 0 0 0-20 14 14 0 0 0-27-3A9 9 0 0 0 20 40z" />
    <line x1="26" y1="46" x2="26" y2="52" />
    <line x1="38" y1="46" x2="38" y2="52" />
  </g>
</svg>
`;

const ICON_RAIN = `
<svg viewBox="0 0 64 64" aria-hidden="true">
  <g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 40h24a10 10 0 0 0 0-20 14 14 0 0 0-27-3A9 9 0 0 0 20 40z" />
    <line x1="24" y1="46" x2="24" y2="56" />
    <line x1="32" y1="46" x2="32" y2="56" />
    <line x1="40" y1="46" x2="40" y2="56" />
  </g>
</svg>
`;

const ICON_SNOW = `
<svg viewBox="0 0 64 64" aria-hidden="true">
  <g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 40h24a10 10 0 0 0 0-20 14 14 0 0 0-27-3A9 9 0 0 0 20 40z" />
    <line x1="26" y1="48" x2="26" y2="56" />
    <line x1="22" y1="52" x2="30" y2="52" />
    <line x1="38" y1="48" x2="38" y2="56" />
    <line x1="34" y1="52" x2="42" y2="52" />
  </g>
</svg>
`;

const ICON_THUNDER = `
<svg viewBox="0 0 64 64" aria-hidden="true">
  <g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 38h24a10 10 0 0 0 0-20 14 14 0 0 0-27-3A9 9 0 0 0 20 38z" />
    <polyline points="30 42 24 54 34 54 28 62" />
  </g>
</svg>
`;

const ICON_RAIN_SHOWERS = `
<svg viewBox="0 0 64 64" aria-hidden="true">
  <g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 40h24a10 10 0 0 0 0-20 14 14 0 0 0-27-3A9 9 0 0 0 20 40z" />
    <line x1="24" y1="46" x2="20" y2="54" />
    <line x1="32" y1="46" x2="28" y2="54" />
    <line x1="40" y1="46" x2="36" y2="54" />
  </g>
</svg>
`;

const ICON_SNOW_SHOWERS = `
<svg viewBox="0 0 64 64" aria-hidden="true">
  <g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 40h24a10 10 0 0 0 0-20 14 14 0 0 0-27-3A9 9 0 0 0 20 40z" />
    <line x1="26" y1="48" x2="26" y2="56" />
    <line x1="22" y1="52" x2="30" y2="52" />
    <line x1="38" y1="48" x2="38" y2="56" />
    <line x1="34" y1="52" x2="42" y2="52" />
  </g>
</svg>
`;

const ICON_HAIL = `
<svg viewBox="0 0 64 64" aria-hidden="true">
  <g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 38h24a10 10 0 0 0 0-20 14 14 0 0 0-27-3A9 9 0 0 0 20 38z" />
    <polyline points="30 42 24 54 34 54 28 62" />
    <circle cx="42" cy="52" r="2" fill="currentColor" stroke="none" />
    <circle cx="48" cy="56" r="2" fill="currentColor" stroke="none" />
  </g>
</svg>
`;

const ICON_SNOW_GRAINS = `
<svg viewBox="0 0 64 64" aria-hidden="true">
  <g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 40h24a10 10 0 0 0 0-20 14 14 0 0 0-27-3A9 9 0 0 0 20 40z" />
    <circle cx="26" cy="50" r="2" fill="currentColor" stroke="none" />
    <circle cx="34" cy="54" r="2" fill="currentColor" stroke="none" />
    <circle cx="42" cy="50" r="2" fill="currentColor" stroke="none" />
  </g>
</svg>
`;

interface WeatherWidgetSettings {
  extraKeywords?: string;
}

interface GeocodingResponse {
  results?: GeoResult[];
}

interface GeoResult {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
  timezone?: string;
}

interface ForecastResponse {
  current?: {
    time?: string;
    temperature_2m?: number;
    relative_humidity_2m?: number;
    apparent_temperature?: number;
    precipitation?: number;
    weather_code?: number;
    wind_speed_10m?: number;
    wind_direction_10m?: number;
  };
  daily?: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
  hourly?: {
    time: string[];
    temperature_2m: number[];
  };
}

interface WeatherWidgetData {
  place: GeoResult;
  forecast: ForecastResponse;
}

function toFahrenheit(celsius: number): number {
  return Math.round((celsius * 9) / 5 + 32);
}

function roundTemp(value: number): number {
  return Math.round(value);
}

function safeNumber(value: number | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function formatNumber(value: number, decimals = 1): string {
  const rounded = Math.round(value * 10 ** decimals) / 10 ** decimals;
  if (Number.isInteger(rounded)) return rounded.toFixed(0);
  return rounded.toFixed(decimals);
}

function buildKeywordPattern(keyword: string): RegExp {
  const parts = keyword.trim().split(/\s+/).map(escapeRegex);
  const escaped = parts.join('\\s+');
  const boundaryStart = '(?:^|[^\\p{L}\\p{N}])';
  const boundaryEnd = '(?:$|[^\\p{L}\\p{N}])';
  return new RegExp(`${boundaryStart}(${escaped})${boundaryEnd}`, 'iu');
}

function buildKeywordList(extraKeywords: string | undefined): string[] {
  const extras = (extraKeywords ?? '')
    .split(',')
    .map((keyword) => keyword.trim())
    .filter((keyword) => keyword.length > 0);

  const unique = new Map<string, string>();
  for (const keyword of [...BASE_KEYWORDS, ...extras]) {
    unique.set(keyword.toLowerCase(), keyword);
  }

  return Array.from(unique.values()).sort((a, b) => b.length - a.length);
}

function findWeatherQuery(query: string, keywords: string[]): { keyword: string; location: string } | null {
  for (const keyword of keywords) {
    const pattern = buildKeywordPattern(keyword);
    if (!pattern.test(query)) continue;

    const location = query
      .replace(pattern, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return { keyword, location };
  }
  return null;
}

function formatLocationName(place: GeoResult): string {
  const parts = [place.name, place.admin1, place.country].filter(Boolean) as string[];
  return parts.join(', ');
}

async function geocodeLocation(api: PluginAPI, location: string): Promise<GeoResult | null> {
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
  url.searchParams.set('name', location);
  url.searchParams.set('count', '1');
  url.searchParams.set('language', 'en');

  const data = await api.fetchJSON<GeocodingResponse>(url.toString());
  if (!data?.results?.length) return null;
  return data.results[0] ?? null;
}

async function fetchForecast(api: PluginAPI, latitude: number, longitude: number): Promise<ForecastResponse | null> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', latitude.toString());
  url.searchParams.set('longitude', longitude.toString());
  url.searchParams.set('current',
    'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m',
  );
  url.searchParams.set('daily', 'weather_code,temperature_2m_max,temperature_2m_min');
  url.searchParams.set('hourly', 'temperature_2m');
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('forecast_days', '7');

  return api.fetchJSON<ForecastResponse>(url.toString());
}

async function loadWeather(api: PluginAPI, location: string): Promise<WeatherWidgetData | null> {
  const place = await geocodeLocation(api, location);
  if (!place) return null;

  const forecast = await fetchForecast(api, place.latitude, place.longitude);
  if (!forecast?.current || !forecast?.daily) return null;

  return { place, forecast };
}

function getWeatherVisual(code: number): { icon: string; description: string } {
  if (code === 0) return { icon: ICON_CLEAR, description: 'Clear sky' };
  if (code >= 1 && code <= 3) return { icon: ICON_PARTLY_CLOUDY, description: 'Partly cloudy' };
  if (code === 45 || code === 48) return { icon: ICON_FOG, description: 'Fog' };
  if (code >= 51 && code <= 55) return { icon: ICON_DRIZZLE, description: 'Drizzle' };
  if (code === 56 || code === 57) return { icon: ICON_DRIZZLE, description: 'Freezing drizzle' };
  if (code >= 61 && code <= 65) return { icon: ICON_RAIN, description: 'Rain' };
  if (code === 66 || code === 67) return { icon: ICON_RAIN, description: 'Freezing rain' };
  if (code >= 71 && code <= 75) return { icon: ICON_SNOW, description: 'Snow' };
  if (code === 77) return { icon: ICON_SNOW_GRAINS, description: 'Snow grains' };
  if (code >= 80 && code <= 82) return { icon: ICON_RAIN_SHOWERS, description: 'Rain showers' };
  if (code === 85 || code === 86) return { icon: ICON_SNOW_SHOWERS, description: 'Snow showers' };
  if (code === 95) return { icon: ICON_THUNDER, description: 'Thunderstorm' };
  if (code === 96 || code === 99) return { icon: ICON_HAIL, description: 'Thunderstorm with hail' };
  return { icon: ICON_CLOUDY, description: 'Cloudy' };
}

function formatCurrentDate(date: Date): { dayLabel: string; dateLabel: string } {
  const dayLabel = new Intl.DateTimeFormat(DEFAULT_LOCALE, { weekday: 'long' }).format(date);
  const dateLabel = new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);

  return { dayLabel, dateLabel };
}

function formatDayShort(date: Date): string {
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, { weekday: 'short' }).format(date);
}

function buildHourlyGraphSvg(hourlyTimes: string[], hourlyTemps: number[]): string {
  const count = Math.min(hourlyTimes.length, hourlyTemps.length, 24);
  if (count < 2) return '';

  const temps = hourlyTemps.slice(0, count);
  const times = hourlyTimes.slice(0, count);

  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const tempRange = maxTemp - minTemp || 1;

  const svgWidth = 645;
  const yTop = -110;
  const yBottom = -30;
  const yRange = Math.abs(yTop - yBottom);

  const points: { x: number; y: number; tempC: number; timeLabel: string }[] = [];
  for (let i = 0; i < count; i++) {
    const x = (i / (count - 1)) * svgWidth;
    const normalized = (temps[i] - minTemp) / tempRange;
    const y = yBottom - normalized * yRange;

    const d = new Date(times[i]);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');

    points.push({ x, y, tempC: temps[i], timeLabel: `${hh}:${mm}` });
  }

  const lineD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
  const fillD = `${lineD} V${yBottom} V0 H0 Z`;

  const labelInterval = 3;
  let labelsHtml = '';
  for (let i = 0; i < count; i += labelInterval) {
    const p = points[i];
    const tempC = roundTemp(p.tempC);
    const tempF = toFahrenheit(tempC);
    const labelY = p.y - 5.45;

    labelsHtml += `<text class="graph-text temp_scale_C" text-anchor="middle" x="${p.x.toFixed(2)}" y="${labelY.toFixed(2)}">${tempC}°</text>`;
    labelsHtml += `<text class="graph-text temp_scale_F" text-anchor="middle" x="${p.x.toFixed(2)}" y="${labelY.toFixed(2)}">${tempF}°</text>`;
    labelsHtml += `<text class="graph-text" text-anchor="middle" x="${p.x.toFixed(2)}" y="-5">${p.timeLabel}</text>`;
  }

  return `
    <div class="weather_graph_box">
      <svg class="weather-graph" viewBox="0 -140 645 140" width="100%" height="100%" preserveAspectRatio="none">
        <linearGradient id="grad" x1="0%" x2="0%" y1="100%" y2="0%">
          <stop offset="0%" style="stop-color:var(--inline-widget-bg);stop-opacity:1"></stop>
          <stop offset="25%" style="stop-color:var(--inline-widget-bg);stop-opacity:1"></stop>
          <stop offset="100%" style="stop-color:orange;stop-opacity:0.2"></stop>
        </linearGradient>
        <path d="${fillD}" fill="url(#grad)"></path>
        <path d="${lineD}" fill="none" stroke="#febb35" stroke-width="2"></path>
        ${labelsHtml}
      </svg>
    </div>
  `;
}

function buildWeatherHtml(data: WeatherWidgetData): string {
  const current = data.forecast.current;
  const daily = data.forecast.daily;
  if (!current || !daily) return '';

  const locationLabel = escapeHtml(formatLocationName(data.place));
  const currentTime = current.time ?? daily.time[0];
  const currentDate = currentTime ? new Date(currentTime) : new Date();
  const { dayLabel, dateLabel } = formatCurrentDate(currentDate);

  const currentTempC = roundTemp(safeNumber(current.temperature_2m));
  const currentTempF = toFahrenheit(currentTempC);
  const feelsLikeC = roundTemp(safeNumber(current.apparent_temperature));
  const feelsLikeF = toFahrenheit(feelsLikeC);
  const humidity = roundTemp(safeNumber(current.relative_humidity_2m));
  const precip = formatNumber(safeNumber(current.precipitation));
  const windKmh = roundTemp(safeNumber(current.wind_speed_10m));
  const windMph = roundTemp(safeNumber(current.wind_speed_10m) * 0.621371);
  const currentCode = Math.round(safeNumber(current.weather_code));
  const currentVisual = getWeatherVisual(currentCode);

  const hourly = data.forecast.hourly;
  const graphHtml = hourly ? buildHourlyGraphSvg(hourly.time, hourly.temperature_2m) : '';

  const daysHtml = daily.time
    .slice(0, 7)
    .map((time, index) => {
      const dayDate = new Date(`${time}T00:00:00`);
      const dayName = escapeHtml(formatDayShort(dayDate));
      const maxC = roundTemp(safeNumber(daily.temperature_2m_max[index]));
      const minC = roundTemp(safeNumber(daily.temperature_2m_min[index]));
      const maxF = toFahrenheit(maxC);
      const minF = toFahrenheit(minC);
      const code = Math.round(safeNumber(daily.weather_code[index]));
      const visual = getWeatherVisual(code);

      return `
        <div class="weather_day">
          <div class="day">${dayName}</div>
          <div class="weather_graphic">${visual.icon}</div>
          <div class="temp">
            <span class="temp_2 temp_scale_C">${maxC}°</span>
            <span class="temp_2 temp_scale_F">${maxF}°</span>
            <span class="temp_1 temp_scale_C">${minC}°</span>
            <span class="temp_1 temp_scale_F">${minF}°</span>
          </div>
        </div>
      `;
    })
    .join('');

  return `
<div id="weather" class="widget_weather">
  <input type="radio" name="temp_scale_radio_group" id="temp_scale_radio_C" checked style="display:none">
  <input type="radio" name="temp_scale_radio_group" id="temp_scale_radio_F" style="display:none">

  <div class="weather_location_and_date_box">
    <div class="weather_location">
      ${LOCATION_ICON}
      <span>${locationLabel}</span>
    </div>
    <div class="weather_current_date">
      <span class="day">${escapeHtml(dayLabel)}</span>, ${escapeHtml(dateLabel)}
    </div>
  </div>

  <div class="weather_header">
    <div class="weather_main_graphic">
      <div class="weather_graphic">${currentVisual.icon}</div>
    </div>
    <div class="weather_temp_deg_box">
      <div class="weather_temp_deg">
        <span class="temp_scale_C">${currentTempC}</span>
        <span class="temp_scale_F">${currentTempF}</span>
        <div class="weather_temp_deg_switch">
          <span class="scale_symbol">°</span>
          <div class="weather_temp_deg_switch_box">
            <label id="scale_to_C" for="temp_scale_radio_C">C</label>
            <span class="sep"></span>
            <label id="scale_to_F" for="temp_scale_radio_F">F</label>
          </div>
        </div>
      </div>
      <div class="weather_temp_feelsLike">
        Feels like <span class="temp_scale_C">${feelsLikeC}°</span><span class="temp_scale_F">${feelsLikeF}°</span>
      </div>
    </div>
    <div class="weather_other_stats_box">
      <ul>
        <li><span>Precipitation</span><span>${precip} mm</span></li>
        <li><span>Humidity</span><span>${humidity}%</span></li>
        <li><span>Wind</span><span class="temp_scale_C">${windKmh} km/h</span><span class="temp_scale_F">${windMph} mph</span></li>
      </ul>
    </div>
    <div class="weather_day_status">${escapeHtml(currentVisual.description)}</div>
  </div>

  <div class="weather_body">
    ${graphHtml}
    <div class="weather_days_box">
      ${daysHtml}
    </div>
  </div>

  <div class="weather_source">Data from Open-Meteo</div>
</div>
  `.trim();
}

function dispatchWeatherWidget(content: string): void {
  if (!content) return;
  window.dispatchEvent(new CustomEvent('provider:widget_weather', {
    detail: { payload: { content, full_page: false } },
  }));
}

function removeInjectedWidget(): void {
  const widget = document.querySelector<HTMLElement>(WIDGET_SELECTOR);
  widget?.remove();
}

export const weatherWidgetPlugin = definePlugin({
  name: 'weather-widget',
  displayName: 'Weather Widget (Multilingual)',
  version: '0.2.0',
  authors: ['corgi'],
  description: 'Loads weather widget for non-English weather queries (e.g. "wetter", "météo", "tiempo")',
  defaultEnabled: false,

  settings: [
    {
      key: 'extraKeywords',
      label: 'Extra weather keywords (comma-separated)',
      type: 'string',
      default: DEFAULT_EXTRA_KEYWORDS,
    },
  ],

  async onStart(api) {
    const settings = await api.loadSettings({ extraKeywords: DEFAULT_EXTRA_KEYWORDS });
    const keywords = buildKeywordList(settings.extraKeywords);

    let activeCleanup: (() => void) | null = null;
    let lastProcessedQuery = '';
    let activationId = 0;

    async function tryActivate(): Promise<void> {
      const pagePath = api.getPagePath();
      if (pagePath !== PAGE_PATH) {
        if (activeCleanup) {
          activeCleanup();
          activeCleanup = null;
        }
        lastProcessedQuery = '';
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const query = params.get('q')?.trim() ?? '';

      if (query === lastProcessedQuery) return;
      lastProcessedQuery = query;

      if (activeCleanup) {
        activeCleanup();
        activeCleanup = null;
      }

      if (!query) return;

      const match = findWeatherQuery(query, keywords);
      if (!match) {
        removeInjectedWidget();
        return;
      }

      const location = match.location.trim();
      if (!location) return;

      const currentActivation = ++activationId;

      const weather = await loadWeather(api, location);
      if (!weather || currentActivation !== activationId) return;

      const html = buildWeatherHtml(weather);
      if (!html) return;

      dispatchWeatherWidget(html);

      const cleanupObserver = api.observeElement(WIDGET_HOLDER_SELECTOR, () => {
        const holder = document.querySelector(WIDGET_HOLDER_SELECTOR);
        if (!holder) return;
        if (holder.querySelector(WIDGET_SELECTOR)) return;
        dispatchWeatherWidget(html);
      }, { childList: true, subtree: true });

      activeCleanup = () => {
        cleanupObserver();
        removeInjectedWidget();
      };
    }

    await tryActivate();

    const pathObserver = new MutationObserver(() => {
      void tryActivate();
    });
    pathObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-path'],
    });

    const cleanupUrlWatch = api.onUrlChange(() => {
      void tryActivate();
    });

    return () => {
      pathObserver.disconnect();
      cleanupUrlWatch();
      if (activeCleanup) {
        activeCleanup();
        activeCleanup = null;
      }
    };
  },
});
