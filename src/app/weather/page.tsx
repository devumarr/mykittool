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
  Gauge,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    uv: number;
    code: number;
    isDay: boolean;
  };
  hourly: { time: string[]; temp: number[]; code: number[] };
  daily: {
    time: string[];
    max: number[];
    min: number[];
    code: number[];
    rain: number[];
  };
  city: string;
  location: string;
}

function decodeWeather(code: number) {
  if (code === 0) return { label: "Clear", icon: Sun, color: "text-amber-500" };
  if (code <= 3)
    return { label: "Partly cloudy", icon: Cloud, color: "text-sky-500" };
  if (code <= 48)
    return { label: "Fog", icon: CloudFog, color: "text-slate-400" };
  if (code <= 57)
    return { label: "Drizzle", icon: CloudDrizzle, color: "text-sky-400" };
  if (code <= 67)
    return { label: "Rain", icon: CloudRain, color: "text-blue-500" };
  if (code <= 77)
    return { label: "Snow", icon: CloudSnow, color: "text-indigo-300" };
  if (code <= 82)
    return { label: "Showers", icon: CloudRain, color: "text-blue-400" };
  if (code <= 86)
    return { label: "Snow showers", icon: CloudSnow, color: "text-indigo-400" };
  if (code >= 95)
    return {
      label: "Thunderstorm",
      icon: CloudLightning,
      color: "text-violet-500",
    };
  return { label: "Changing", icon: Cloud, color: "text-foreground/50" };
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
        if (
          typeof city.latitude === "number" &&
          typeof city.longitude === "number"
        ) {
          fetchForecast(city, false);
        } else {
          localStorage.removeItem(LAST_KEY);
        }
      }
    } catch {
      localStorage.removeItem(LAST_KEY);
    }
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
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=6&language=en&format=json`,
        { signal: ac.signal },
      );
      const data = await res.json();
      setResults(data.results || []);
      if (!data.results?.length)
        setError("No city found. Try another spelling.");
      else setError(null);
    } catch (e: any) {
      if (e.name !== "AbortError") setError("City search failed. Try again.");
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
    if (
      !city ||
      typeof city.latitude !== "number" ||
      typeof city.longitude !== "number"
    ) {
      localStorage.removeItem(LAST_KEY);
      return;
    }
    setLoading(true);
    setError(null);
    setSelected(city);
    try {
      const url =
        `https://api.open-meteo.com/v1/forecast?latitude=\( {city.latitude}&longitude= \){city.longitude}` +
        `&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,precipitation,is_day` +
        `&hourly=temperature_2m,weather_code` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum` +
        `&timezone=auto`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("bad");
      const data = await res.json();
      if (!data.current) throw new Error("bad");

      setWeather({
        current: {
          temp: data.current.temperature_2m,
          feelsLike: data.current.apparent_temperature,
          humidity: data.current.relative_humidity_2m,
          wind: data.current.wind_speed_10m,
          windDir: data.current.wind_direction_10m ?? 0,
          precip: data.current.precipitation ?? 0,
          uv: 0,
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
          rain: data.daily.precipitation_sum || data.daily.time.map(() => 0),
        },
        city: city.name,
        location: `\( {city.admin1 ? city.admin1 + ", " : ""} \){city.country}`,
      });
      setResults([]);
      saveRecent(city);
      if (notify) toast({ title: city.name, description: "Forecast updated." });
    } catch {
      if (notify) {
        setError("Could not load forecast. Check internet and try again.");
      } else {
        localStorage.removeItem(LAST_KEY);
      }
    } finally {
      setLoading(false);
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast({ variant: "destructive", title: "Location not supported" });
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://geocoding-api.open-meteo.com/v1/reverse?latitude=\( {coords.latitude}&longitude= \){coords.longitude}&count=1&language=en&format=json`,
          );
          const data = await res.json();
          const city: CityResult = data.results?.[0] || {
            id: Date.now(),
            name: "My location",
            country: "",
            latitude: coords.latitude,
            longitude: coords.longitude,
            country_code: "",
          };
          fetchForecast(city);
        } catch {
          fetchForecast({
            id: Date.now(),
            name: "My location",
            country: "",
            latitude: coords.latitude,
            longitude: coords.longitude,
            country_code: "",
          });
        }
      },
      () => {
        setLoading(false);
        setError("Allow location in the browser, or search a city.");
      },
    );
  };

  const resetAll = () => {
    setQuery("");
    setResults([]);
    setSelected(null);
    setWeather(null);
    setError(null);
    localStorage.removeItem(LAST_KEY);
  };

  const toggleUnit = () => {
    const next: Unit = unit === "c" ? "f" : "c";
    setUnit(next);
    localStorage.setItem(UNIT_KEY, next);
  };

  const now = weather ? decodeWeather(weather.current.code) : null;
  const NowIcon = now?.icon || Cloud;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
            <Cloud className="h-3.5 w-3.5" /> Weather
          </p>
          <h1 className="text-3xl font-black tracking-tight md:text-5xl">
            Weather <span className="text-primary">forecast</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-foreground/60">
            Search any city or use your location. Hourly + 7-day forecast. No
            account.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <GetHelp toolId="weather" />
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={toggleUnit}
          >
            °{unit === "c" ? "C" : "F"}
          </Button>
          {weather && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              disabled={loading}
              onClick={() => selected && fetchForecast(selected)}
            >
              <RotateCcw
                className={cn("mr-2 h-3.5 w-3.5", loading && "animate-spin")}
              />
              Refresh
            </Button>
          )}
          {(weather || query) && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={resetAll}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" /> Reset
            </Button>
          )}
        </div>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-5">
          <Card className="overflow-hidden rounded-[1.8rem] border-border shadow-xl">
            <CardHeader className="border-b border-border bg-muted/40">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Search className="h-4 w-4 text-primary" /> Find a city
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              <div>
                <Label className="mb-2 block text-xs text-foreground/50">
                  City name
                </Label>
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Lahore, London, Dubai…"
                  className="h-12 rounded-xl"
                />
              </div>
              <Button
                className="h-12 w-full rounded-xl"
                disabled={loading}
                onClick={useMyLocation}
                variant="outline"
              >
                {loading && !query ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Navigation2 className="mr-2 h-4 w-4 text-primary" />
                )}
                Use my location
              </Button>

              {results.length > 0 && (
                <div className="overflow-hidden rounded-2xl border border-border">
                  {results.map((city, i) => (
                    <button
                      key={String(city.id) + "-" + String(i)}
                      onClick={() => fetchForecast(city)}
                      className="flex w-full items-center justify-between border-b border-border px-4 py-3 text-left last:border-0 hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm font-semibold">{city.name}</p>
                          <p className="text-xs text-foreground/50">
                            {city.admin1 ? `${city.admin1}, ` : ""}
                            {city.country}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-foreground/30" />
                    </button>
                  ))}
                </div>
              )}

              {recents.length > 0 && results.length === 0 && (
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-foreground/40">
                    Recent
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {recents.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => fetchForecast(c)}
                        className="rounded-full border border-border px-3 py-1.5 text-xs hover:border-primary hover:text-primary"
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-3 rounded-[1.6rem] border border-border bg-muted/30 p-5">
            <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
            <p className="text-sm text-foreground/60">
              Location is used only in this tab. Nothing is saved on our
              servers.
            </p>
          </div>
        </div>

        <div className="lg:col-span-7">
          <Card className="min-h-[560px] overflow-hidden rounded-[1.8rem] border-border shadow-xl">
            <CardHeader className="border-b border-border bg-muted/40">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Gauge className="h-4 w-4 text-primary" /> Forecast
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              {loading && (
                <div className="flex flex-col items-center justify-center py-24 text-primary">
                  <Loader2 className="h-10 w-10 animate-spin" />
                  <p className="mt-4 text-sm">Loading forecast…</p>
                </div>
              )}

              {!weather && !loading && (
                <div className="flex flex-col items-center justify-center py-24 text-foreground/30">
                  <Cloud className="h-16 w-16" />
                  <p className="mt-4 text-sm">Search a city to see weather</p>
                </div>
              )}

              {weather && !loading && now && (
                <div className="space-y-10">
                  <div className="text-center">
                    <div
                      className={cn(
                        "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10",
                        now.color,
                      )}
                    >
                      <NowIcon className="h-8 w-8" />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                      {now.label}
                      {weather.current.isDay ? " · Day" : " · Night"}
                    </p>
                    <p className="mt-2 text-7xl font-black tracking-tighter">
                      {showTemp(weather.current.temp, unit)}°
                    </p>
                    <p className="mt-1 text-sm text-foreground/50">
                      Feels like {showTemp(weather.current.feelsLike, unit)}°
                    </p>
                    <h2 className="mt-4 text-2xl font-black">{weather.city}</h2>
                    <p className="text-xs text-foreground/45">
                      {weather.location}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      {
                        icon: Droplets,
                        l: "Humidity",
                        v: `${weather.current.humidity}%`,
                      },
                      {
                        icon: Wind,
                        l: "Wind",
                        v: `${Math.round(weather.current.wind)} km/h`,
                      },
                      {
                        icon: Compass,
                        l: "Direction",
                        v: windLabel(weather.current.windDir),
                      },
                      {
                        icon: CloudRain,
                        l: "Rain now",
                        v: `${weather.current.precip} mm`,
                      },
                    ].map((s) => (
                      <div
                        key={s.l}
                        className="rounded-2xl border border-border bg-muted/30 p-4"
                      >
                        <s.icon className="mb-2 h-4 w-4 text-primary" />
                        <p className="text-[11px] text-foreground/45">{s.l}</p>
                        <p className="text-sm font-bold">{s.v}</p>
                      </div>
                    ))}
                  </div>

                  <div>
                    <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground/40">
                      <Clock className="h-4 w-4 text-primary" /> Next 24 hours
                    </div>
                    <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
                      {weather.hourly.time.map((t, i) => {
                        const w = decodeWeather(weather.hourly.code[i]);
                        const Icon = w.icon;
                        return (
                          <div
                            key={t}
                            className="min-w-[76px] rounded-2xl border border-border bg-muted/20 px-3 py-4 text-center"
                          >
                            <p className="text-[10px] text-foreground/40">
                              {new Date(t)
                                .getHours()
                                .toString()
                                .padStart(2, "0")}
                              :00
                            </p>
                            <Icon
                              className={cn("mx-auto my-2 h-4 w-4", w.color)}
                            />
                            <p className="text-sm font-bold">
                              {showTemp(weather.hourly.temp[i], unit)}°
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground/40">
                      <Calendar className="h-4 w-4 text-primary" /> 7 days
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                      {weather.daily.time.map((t, i) => {
                        const w = decodeWeather(weather.daily.code[i]);
                        const Icon = w.icon;
                        return (
                          <div
                            key={t}
                            className={cn(
                              "rounded-2xl border p-3 text-center",
                              i === 0
                                ? "border-primary/30 bg-primary/10"
                                : "border-border bg-muted/20",
                            )}
                          >
                            <p className="text-[10px] font-semibold text-foreground/50">
                              {i === 0
                                ? "Today"
                                : new Date(t).toLocaleDateString("en-US", {
                                    weekday: "short",
                                  })}
                            </p>
                            <Icon
                              className={cn("mx-auto my-2 h-5 w-5", w.color)}
                            />
                            <p className="text-sm font-black">
                              {showTemp(weather.daily.max[i], unit)}°
                            </p>
                            <p className="text-[10px] text-foreground/40">
                              {showTemp(weather.daily.min[i], unit)}° ·{" "}
                              {weather.daily.rain[i]}mm
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
