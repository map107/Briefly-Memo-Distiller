import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface CountryEntry {
  name: string;
  role: "primary" | "secondary" | string;
  note: string;
}

export interface WorldMapData {
  title: string;
  countries: CountryEntry[];
  summary: string;
}

const ROLE_COLORS: Record<string, string> = {
  primary: "hsl(var(--primary))",
  secondary: "hsl(var(--primary) / 0.45)",
};

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z]/g, "");
}

export function WorldMapViz({ data }: { data: WorldMapData }) {
  const [hovered, setHovered] = useState<CountryEntry | null>(null);

  const lookup = new Map(data.countries.map((c) => [normalize(c.name), c]));

  function fillFor(geoName: string) {
    const entry = lookup.get(normalize(geoName));
    if (!entry) return "hsl(var(--muted))";
    return ROLE_COLORS[entry.role] ?? ROLE_COLORS["secondary"];
  }

  function entryFor(geoName: string) {
    return lookup.get(normalize(geoName)) ?? null;
  }

  return (
    <div className="space-y-4">
      <h3 className="font-serif font-semibold text-lg text-foreground">{data.title}</h3>

      <div className="border rounded-lg overflow-hidden bg-muted/20">
        <ComposableMap
          projection="geoNaturalEarth1"
          projectionConfig={{ scale: 160 }}
          style={{ width: "100%", height: "auto" }}
        >
          <ZoomableGroup>
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const name: string = geo.properties.name ?? "";
                  const entry = entryFor(name);
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fillFor(name)}
                      stroke="hsl(var(--background))"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none" },
                        hover: { outline: "none", opacity: 0.8, cursor: entry ? "pointer" : "default" },
                        pressed: { outline: "none" },
                      }}
                      onMouseEnter={() => entry && setHovered(entry)}
                      onMouseLeave={() => setHovered(null)}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {hovered && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-3 text-sm">
          <span className="font-semibold text-foreground">{hovered.name}</span>
          {" — "}
          <span className="text-muted-foreground">{hovered.note}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {data.countries.map((c) => (
          <div
            key={c.name}
            className="flex items-center gap-2 text-sm border rounded-md px-3 py-1.5 bg-card"
          >
            <span
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ background: ROLE_COLORS[c.role] ?? ROLE_COLORS["secondary"] }}
            />
            <span className="font-medium text-foreground">{c.name}</span>
            <span className="text-muted-foreground text-xs">— {c.note}</span>
          </div>
        ))}
      </div>

      {data.summary && (
        <p className="text-sm text-muted-foreground leading-relaxed border-t pt-4">{data.summary}</p>
      )}
    </div>
  );
}
