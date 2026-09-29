"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Cloud,
  Sun,
  CloudRain,
  CloudLightning,
  Wind,
  Droplets,
  Search,
  MapPin,
  Calendar,
  RotateCcw,
  CloudFog,
  CloudSnow,
  CloudDrizzle,
  AlertCircle,
  Clock,
  Navigation2,
  Trash2,
  Loader2,
  ChevronRight,
  ShieldCheck,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { GetHelp } from "@/components/mykittool/get-help";

const LAST_KEY = "mkt_weather_last";
const RECENTS_KEY = "mkt_weather_recents";
const UNIT_KEY = "mkt_weather_unit";

type Unit = "c" | "f";

interface CityResult {
  id: number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  country_code: string;
}

interface WeatherData {
  current: {
    temp: number;
    feelsLike: number;
    humidity: number;
    wind: number;
    windDir: number;
    precip: number;
    code: number;
    isDay: boolean;
  };
  hourly: { time: string[]; temp: number[]; code: number[] };
  daily: { time: string[]; max: number[]; min: number[]; code: number[] };
  city: string;
  location: string;
}

function decodeWeather(code: number) {
  if (code === 0) return { label: "Clear", icon: Sun };
  if (code <= 3) return { label: "Partly cloudy", icon: Cloud };
  if (code <= 48) return { label: "Fog", icon: CloudFog };
  if (code <= 57) return { label: "Drizzle", icon: CloudDrizzle };
  if (code <= 67) return { label: "Rain", icon: CloudRain };
  if (code <= 77) return { label: "Snow", icon: CloudSnow };
  if (code <= 82) return { label: "Showers", icon: CloudRain };
  if (code <= 86) return { label: "Snow showers", icon: CloudSnow };
  if (code >= 95) return { label: "Storm", icon: CloudLightning };
  return { label: "Changing", icon: Cloud };
}

function windLabel(deg: number) {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

function toF(c: number) {
  return (c * 9) / 5 + 32;
}

function showTemp(n: number, unit: Unit) {
  return Math.round(unit === "f" ? toF(n) : n);
}

export default function WeatherPage() {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CityResult[]>([]);
  const [selected, setSelected] = useState<CityResult | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnit] = useState<Unit>("c");
  const [recents, setRecents] = useState<CityResult[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const u = localStorage.getItem(UNIT_KEY) as Unit | null;
      if (u === "c" || u === "f") setUnit(u);
      const r = localStorage.getItem(RECENTS_KEY);
      if (r) setRecents(JSON.parse(r));
      const last = localStorage.getItem(LAST_KEY);
      if (last) {
        const city = JSON.parse(last) as CityResult;
        if (typeof city.latitude === "number") fetchForecast(city, false);
      }
    } catch {}
  }, []);

  const saveRecent = (city: CityResult) => {
    setRecents((prev) => {
      const next = [city, ...prev.filter((c) => c.id !== city.id)].slice(0, 5);
      localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
      return next;
    });
    localStorage.setItem(LAST_KEY, JSON.stringify(city));
  };

  const searchCities = useCallback(async (name: string) => {
    if (name.trim().length < 2) {
      setResults([]);
      return;
    }
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    try {
      const res = await fetch(
        "https://geocoding-api.open-meteo.com/v1/search?name=" +
          encodeURIComponent(name) +
          "&count=6&language=en&format=json",
        { signal: ac.signal },
      );
      const data = await res.json();
      setResults(data.results || []);
      setError(data.results && data.results.length ? null : "No city found.");
    } catch (e: any) {
      if (e.name !== "AbortError") setError("City search failed.");
    }
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => searchCities(query), 350);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, searchCities]);

  const fetchForecast = async (city: CityResult, notify = true) => {
    if (!city || city.latitude == null) return;
    setLoading(true);
    setError(null);
    setSelected(city);
    try {
      const res = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=" +
          city.latitude +
          "&longitude=" +
          city.longitude +
          "&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,precipitation,is_day" +
          "&hourly=temperature_2m,weather_code" +
          "&daily=weather_code,temperature_2m_max,temperature_2m_min" +
          "&timezone=auto",
      );
      const data = await res.json();
      if (!data || !data.current) throw new Error("bad");
      setWeather({
        current: {
          temp: data.current.temperature_2m,
          feelsLike: data.current.apparent_temperature,
          humidity: data.current.relative_humidity_2m,
          wind: data.current.wind_speed_10m,
          windDir: data.current.wind_direction_10m || 0,
          precip: data.current.precipitation || 0,
          code: data.current.weather_code,
          isDay: data.current.is_day === 1,
        },
        hourly: {
          time: data.hourly.time.slice(0, 24),
          temp: data.hourly.temperature_2m.slice(0, 24),
          code: data.hourly.weather_code.slice(0, 24),
        },
        daily: {
          time: data.daily.time,
          max: data.daily.temperature_2m_max,
          min: data.daily.temperature_2m_min,
          code: data.daily.weather_code,
        },
        city: city.name,
        location: (city.admin1 ? city.admin1 + ", " : "") + city.country,
      });
      setResults([]);
      saveRecent(city);
      if (notify) toast({ title: city.name, description: "Updated." });
    } catch {
      if (notify) setError("Could not load forecast. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Location not supported on this device.");
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async function (pos) {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        let name = "";
        let area = "";
        let country = "";

        try {
          const r = await fetch(
            "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=" +
              lat +
              "&longitude=" +
              lon +
              "&localityLanguage=en",
          );
          const d = await r.json();
          const info = (d.localityInfo && d.localityInfo.informative) || [];
          const admin = (d.localityInfo && d.localityInfo.administrative) || [];
          const mohalla = info.length ? info[info.length - 1].name : "";
          const city = d.city || d.locality || "";
          const district =
            (
              admin.find(function (a: any) {
                return a.adminLevel === 5 || a.adminLevel === 6;
              }) || {}
            ).name || "";
          country = d.countryName || "";
          name = mohalla || city || district || "Current location";
          area = [
            city && city !== name ? city : "",
            d.principalSubdivision || "",
          ]
            .filter(Boolean)
            .join(", ");
        } catch {}

        if (!name || name === "Current location") {
          try {
            const r2 = await fetch(
              "https://nominatim.openstreetmap.org/reverse?lat=" +
                lat +
                "&lon=" +
                lon +
                "&format=json&zoom=16&addressdetails=1",
            );
            const d2 = await r2.json();
            const a = d2.address || {};
            name =
              a.suburb ||
              a.neighbourhood ||
              a.village ||
              a.town ||
              a.city ||
              a.county ||
              name ||
              "Current location";
            area = [a.city || a.town || a.county, a.state]
              .filter(Boolean)
              .join(", ");
            country = a.country || country;
          } catch {}
        }

        fetchForecast({
          id: Date.now(),
          name: name,
          country: country,
          admin1: area,
          latitude: lat,
          longitude: lon,
          country_code: "",
        });
      },
      function () {
        setLoading(false);
        setError("Allow location permission, then try again.");
      },
    );
  };
  const now = weather ? decodeWeather(weather.current.code) : null;
  const NowIcon = now ? now.icon : Cloud;

  return (
    <div className="w-full max-w-full overflow-x-hidden px-3 pb-28 pt-6 sm:px-4 md:px-6 md:pt-12">
      <div className="mx-auto w-full max-w-6xl space-y-4">
        <div className="w-full min-w-0 rounded-2xl border border-border bg-card p-4 sm:rounded-[1.8rem] sm:p-6">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.35em] text-primary">
            Weather
          </p>
          <h1 className="break-words text-2xl font-black tracking-tight sm:text-4xl">
            WEATHER FORECAST
          </h1>
          <p className="mt-2 text-sm text-foreground/55">
            Search any city or use your location. Hourly + 7-day.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <GetHelp toolId="weather" />
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-xl"
              onClick={() => {
                const n = unit === "c" ? "f" : "c";
                setUnit(n);
                localStorage.setItem(UNIT_KEY, n);
              }}
            >
              °{unit === "c" ? "C" : "F"}
            </Button>
            {weather && (
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-xl"
                disabled={loading}
                onClick={() => selected && fetchForecast(selected)}
              >
                <RotateCcw
                  className={cn("mr-1 h-3.5 w-3.5", loading && "animate-spin")}
                />
                Refresh
              </Button>
            )}
            {(weather || query) && (
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-xl"
                onClick={() => {
                  setQuery("");
                  setResults([]);
                  setWeather(null);
                  setError(null);
                  localStorage.removeItem(LAST_KEY);
                }}
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" />
                Reset
              </Button>
            )}
          </div>
        </div>

        <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="min-w-0 space-y-4 lg:col-span-5">
            <Card className="w-full min-w-0 overflow-hidden rounded-2xl border-border shadow-sm sm:rounded-[1.8rem]">
              <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-primary to-transparent" />
              <CardContent className="space-y-3 p-4 sm:p-6">
                <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-foreground/50">
                  <Search className="h-4 w-4 text-primary" /> Find a city
                </p>
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Lahore, London…"
                  className="h-11 w-full rounded-xl"
                />
                <Button
                  className="h-11 w-full rounded-xl"
                  disabled={loading}
                  onClick={useMyLocation}
                >
                  <Navigation2 className="mr-2 h-4 w-4" />
                  Use my location
                </Button>

                {results.length > 0 && (
                  <div className="w-full overflow-hidden rounded-xl border border-border">
                    {results.map((city, i) => (
                      <button
                        key={String(city.id) + "-" + String(i)}
                        onClick={() => fetchForecast(city)}
                        className="flex w-full min-w-0 items-center justify-between border-b border-border px-3 py-3 text-left last:border-0 hover:bg-muted/50"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <MapPin className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                              {city.name}
                            </p>
                            <p className="truncate text-xs text-foreground/50">
                              {(city.admin1 ? city.admin1 + ", " : "") +
                                city.country}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 shrink-0 text-foreground/30" />
                      </button>
                    ))}
                  </div>
                )}

                {recents.length > 0 && results.length === 0 && (
                  <div className="flex flex-wrap gap-2">
                    {recents.map((c, i) => (
                      <button
                        key={String(c.id) + "-r" + String(i)}
                        onClick={() => fetchForecast(c)}
                        className="rounded-full border border-border px-3 py-1 text-xs"
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}

                {error && (
                  <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className="min-w-0 break-words">{error}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex w-full min-w-0 gap-2 rounded-2xl border border-border bg-card p-4">
              <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
              <p className="min-w-0 text-xs text-foreground/55">
                Location is used only in this tab. Nothing is saved on our
                servers.
              </p>
            </div>
          </div>

          <div className="min-w-0 lg:col-span-7">
            <Card className="w-full min-w-0 overflow-hidden rounded-2xl border-border shadow-sm sm:rounded-[1.8rem]">
              <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-primary to-transparent" />
              <CardContent className="w-full min-w-0 p-4 sm:p-6">
                <p className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-foreground/50">
                  <Clock className="h-4 w-4 text-primary" /> Forecast
                </p>

                {loading && (
                  <div className="flex justify-center py-16 text-primary">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                )}

                {!weather && !loading && (
                  <div className="flex flex-col items-center rounded-xl border border-dashed border-border py-14 text-foreground/40">
                    <Cloud className="mb-2 h-8 w-8 text-primary/40" />
                    <p className="text-sm">No forecast yet.</p>
                  </div>
                )}

                {weather && !loading && now && (
                  <div className="w-full min-w-0 space-y-6">
                    <div className="text-center">
                      <NowIcon className="mx-auto h-9 w-9 text-primary" />
                      <p className="mt-2 text-[10px] font-black uppercase tracking-[0.25em] text-primary">
                        {now.label}
                        {weather.current.isDay ? " · Day" : " · Night"}
                      </p>
                      <p className="mt-1 text-5xl font-black tracking-tighter sm:text-6xl">
                        {showTemp(weather.current.temp, unit)}°
                      </p>
                      <p className="text-sm text-foreground/50">
                        Feels like {showTemp(weather.current.feelsLike, unit)}°
                      </p>
                      <h2 className="mt-2 break-words text-lg font-black">
                        {weather.city}
                      </h2>
                      <p className="break-words text-xs text-foreground/45">
                        {weather.location}
                      </p>
                    </div>

                    <div className="grid w-full grid-cols-2 gap-2">
                      {[
                        {
                          icon: Droplets,
                          l: "Humidity",
                          v: weather.current.humidity + "%",
                        },
                        {
                          icon: Wind,
                          l: "Wind",
                          v: Math.round(weather.current.wind) + " km/h",
                        },
                        {
                          icon: Compass,
                          l: "Direction",
                          v: windLabel(weather.current.windDir),
                        },
                        {
                          icon: CloudRain,
                          l: "Rain",
                          v: weather.current.precip + " mm",
                        },
                      ].map((s) => (
                        <div
                          key={s.l}
                          className="min-w-0 rounded-xl border border-border bg-muted/30 p-3"
                        >
                          <s.icon className="mb-1 h-4 w-4 text-primary" />
                          <p className="text-[11px] text-foreground/50">
                            {s.l}
                          </p>
                          <p className="truncate text-sm font-bold">{s.v}</p>
                        </div>
                      ))}
                    </div>

                    <div className="w-full min-w-0">
                      <p className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-foreground/50">
                        Next 24 hours
                      </p>
                      <div className="-mx-0 w-full overflow-x-auto">
                        <div className="flex w-max gap-2 pb-1">
                          {weather.hourly.time.map((t, i) => {
                            const w = decodeWeather(weather.hourly.code[i]);
                            const Icon = w.icon;
                            return (
                              <div
                                key={String(i)}
                                className="w-16 shrink-0 rounded-xl border border-border bg-muted/20 py-3 text-center"
                              >
                                <p className="text-[10px] text-foreground/45">
                                  {new Date(t)
                                    .getHours()
                                    .toString()
                                    .padStart(2, "0")}
                                  :00
                                </p>
                                <Icon className="mx-auto my-1 h-4 w-4 text-primary" />
                                <p className="text-sm font-bold">
                                  {showTemp(weather.hourly.temp[i], unit)}°
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="w-full min-w-0">
                      <p className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-foreground/50">
                        <Calendar className="h-3.5 w-3.5 text-primary" /> 7 days
                      </p>
                      <div className="w-full overflow-x-auto">
                        <div className="flex w-max gap-2 pb-1">
                          {weather.daily.time.map((t, i) => {
                            const w = decodeWeather(weather.daily.code[i]);
                            const Icon = w.icon;
                            return (
                              <div
                                key={String(i)}
                                className={cn(
                                  "w-20 shrink-0 rounded-xl border p-3 text-center",
                                  i === 0
                                    ? "border-primary/30 bg-primary/5"
                                    : "border-border bg-muted/20",
                                )}
                              >
                                <p className="text-[10px] font-semibold text-foreground/55">
                                  {i === 0
                                    ? "Today"
                                    : new Date(t).toLocaleDateString("en-US", {
                                        weekday: "short",
                                      })}
                                </p>
                                <Icon className="mx-auto my-1 h-4 w-4 text-primary" />
                                <p className="text-sm font-black">
                                  {showTemp(weather.daily.max[i], unit)}°
                                </p>
                                <p className="text-[10px] text-foreground/45">
                                  {showTemp(weather.daily.min[i], unit)}°
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
