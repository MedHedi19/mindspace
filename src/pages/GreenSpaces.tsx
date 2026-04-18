import { useMemo, useState } from 'react';
import { Leaf, MapPin, Star, Filter, TreePine, Flower2, Mountain, Sprout, Trees, Building2, LocateFixed, Loader2 } from 'lucide-react';
import { greenSpaces } from '../data/greenSpaces';
import type { GreenSpace } from '../types';

interface OverpassElement {
  id: number;
  type: 'node' | 'way' | 'relation';
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

interface NearbySearchResult {
  spaces: GreenSpace[];
  endpoint: string;
}

const OVERPASS_ENDPOINTS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass-api.de/api/interpreter',
];

async function fetchOverpassFromAnyEndpoint(query: string): Promise<{ data: OverpassResponse; endpoint: string }> {
  let lastError: Error | null = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 14000);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=UTF-8',
        },
        body: query,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Overpass request failed (${response.status}) on ${endpoint}`);
      }

      const data: OverpassResponse = await response.json();
      if (!data.elements) {
        throw new Error(`Invalid Overpass response from ${endpoint}`);
      }

      window.clearTimeout(timeout);
      return { data, endpoint };
    } catch (error) {
      window.clearTimeout(timeout);
      lastError = error instanceof Error ? error : new Error('Unknown Overpass error');
    }
  }

  throw lastError ?? new Error('All OpenStreetMap endpoints failed.');
}

function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 60000,
    });
  });
}

function toRad(value: number): number {
  return (value * Math.PI) / 180;
}

function calculateDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const earthRadius = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
}

function mapOsmType(tags: Record<string, string> = {}): GreenSpace['type'] {
  const leisure = tags.leisure ?? '';
  const boundary = tags.boundary ?? '';
  const landuse = tags.landuse ?? '';
  const name = (tags.name ?? '').toLowerCase();

  if (leisure === 'garden' || name.includes('botanic')) return 'Botanical Garden';
  if (boundary === 'protected_area' || landuse === 'forest' || leisure === 'nature_reserve') return 'Nature Reserve';
  if (landuse === 'forest' || name.includes('forest')) return 'Forest Park';
  if (leisure === 'park') return 'Urban Park';
  return 'Urban Green Space';
}

function benefitsForType(type: string): string[] {
  if (type === 'Forest Park') return ['Stress reduction', 'Deep restoration', 'Fresh air'];
  if (type === 'Botanical Garden') return ['Anxiety relief', 'Mindfulness', 'Improved mood'];
  if (type === 'Nature Reserve') return ['Deep restoration', 'Perspective shift', 'Awe & wonder'];
  if (type === 'Urban Park') return ['Mental clarity', 'Improved mood', 'Social connection'];
  return ['Quick recharge', 'Urban escape', 'Mindfulness'];
}

function activitiesForType(type: string): string[] {
  if (type === 'Forest Park') return ['Walking', 'Forest bathing', 'Breathing exercises', 'Photography'];
  if (type === 'Botanical Garden') return ['Relaxation', 'Mindful walk', 'Journaling', 'Quiet reflection'];
  if (type === 'Nature Reserve') return ['Hiking', 'Nature observation', 'Meditation', 'Grounding'];
  if (type === 'Urban Park') return ['Walking', 'Light exercise', 'Picnic', 'Reading'];
  return ['Short break', 'Mindful breathing', 'Stretching', 'Quiet reflection'];
}

function defaultImageForType(type: string): string {
  if (type === 'Forest Park') return 'https://images.pexels.com/photos/775201/pexels-photo-775201.jpeg?auto=compress&cs=tinysrgb&w=800';
  if (type === 'Botanical Garden') return 'https://images.pexels.com/photos/158028/bellingrath-gardens-alabama-landscape-scenic-158028.jpeg?auto=compress&cs=tinysrgb&w=800';
  if (type === 'Nature Reserve') return 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=800';
  if (type === 'Urban Park') return 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800';
  return 'https://images.pexels.com/photos/1105019/pexels-photo-1105019.jpeg?auto=compress&cs=tinysrgb&w=800';
}

async function fetchNearbyGreenSpaces(lat: number, lng: number): Promise<NearbySearchResult> {
  const query = `
[out:json][timeout:25];
(
  node["leisure"~"park|garden|nature_reserve"](around:15000,${lat},${lng});
  way["leisure"~"park|garden|nature_reserve"](around:15000,${lat},${lng});
  relation["leisure"~"park|garden|nature_reserve"](around:15000,${lat},${lng});
  node["boundary"="protected_area"](around:15000,${lat},${lng});
  way["boundary"="protected_area"](around:15000,${lat},${lng});
  relation["boundary"="protected_area"](around:15000,${lat},${lng});
  node["landuse"~"forest|recreation_ground|grass"](around:15000,${lat},${lng});
  way["landuse"~"forest|recreation_ground|grass"](around:15000,${lat},${lng});
  relation["landuse"~"forest|recreation_ground|grass"](around:15000,${lat},${lng});
  node["natural"~"wood|heath|scrub"](around:15000,${lat},${lng});
  way["natural"~"wood|heath|scrub"](around:15000,${lat},${lng});
  relation["natural"~"wood|heath|scrub"](around:15000,${lat},${lng});
);
out center tags;
`;

  const { data, endpoint } = await fetchOverpassFromAnyEndpoint(query);
  if (!data.elements || data.elements.length === 0) {
    return { spaces: [], endpoint };
  }

  const candidates: Array<GreenSpace | null> = data.elements
    .map((element, index) => {
      const placeLat = element.lat ?? element.center?.lat;
      const placeLng = element.lon ?? element.center?.lon;
      if (placeLat === undefined || placeLng === undefined) {
        return null;
      }

      const tags = element.tags ?? {};
      const type = mapOsmType(tags);
      const distanceKm = calculateDistanceKm(lat, lng, placeLat, placeLng);
      const syntheticRating = Math.max(3.8, 4.9 - distanceKm / 10);

      return {
        id: index + 1,
        placeId: `${element.type}-${element.id}`,
        name: tags.name ?? `${type} #${index + 1}`,
        type,
        distance: `${distanceKm.toFixed(1)} km`,
        rating: Math.round(syntheticRating * 10) / 10,
        benefits: benefitsForType(type),
        image: defaultImageForType(type),
        description: tags.name
          ? `${tags.name} is a nearby natural location suitable for wellbeing walks and stress relief.`
          : 'A nearby natural space discovered from your current location.',
        activities: activitiesForType(type),
        latitude: placeLat,
        longitude: placeLng,
        address: tags['addr:street'] ?? tags.address ?? undefined,
      };
    });

  const mapped: GreenSpace[] = candidates
    .filter((space): space is GreenSpace => space !== null)
    .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
    .slice(0, 40);

  const namedPlaces = mapped.filter(space => !space.name.startsWith('Urban Green Space #') && !space.name.startsWith('Forest Park #') && !space.name.startsWith('Nature Reserve #') && !space.name.startsWith('Urban Park #') && !space.name.startsWith('Botanical Garden #'));
  const finalPlaces = (namedPlaces.length > 0 ? namedPlaces : mapped).slice(0, 12);

  return { spaces: finalPlaces, endpoint };
}

const typeIcons: Record<string, React.ReactNode> = {
  'Forest Park': <Trees size={16} />,
  'Botanical Garden': <Flower2 size={16} />,
  'Urban Park': <Leaf size={16} />,
  'Therapeutic Garden': <Sprout size={16} />,
  'Nature Reserve': <Mountain size={16} />,
  'Urban Green Space': <Building2 size={16} />,
};

const moodFilters = [
  { label: 'Stressed', tag: 'Stress reduction' },
  { label: 'Anxious', tag: 'Anxiety relief' },
  { label: 'Low Energy', tag: 'Improved mood' },
  { label: 'Need Focus', tag: 'Mental clarity' },
  { label: 'Lonely', tag: 'Social connection' },
  { label: 'Overwhelmed', tag: 'Deep restoration' },
];

interface SpaceCardProps {
  space: GreenSpace;
  expanded: boolean;
  onToggle: () => void;
  userLocation: { lat: number; lng: number } | null;
}

function SpaceCard({ space, expanded, onToggle, userLocation }: SpaceCardProps) {
  const destination =
    space.latitude !== undefined && space.longitude !== undefined
      ? `${space.latitude},${space.longitude}`
      : encodeURIComponent(`${space.name} ${space.address ?? ''}`);
  const origin = userLocation ? `&origin=${userLocation.lat},${userLocation.lng}` : '';
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}${origin}`;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 group">
      <div className="relative overflow-hidden h-48">
        <img
          src={space.image}
          alt={space.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div>
            <div className="text-white font-bold text-base leading-tight">{space.name}</div>
            <div className="flex items-center gap-1 text-white/80 text-xs mt-0.5">
              {typeIcons[space.type]}
              {space.type}
            </div>
          </div>
          <div className="flex items-center gap-1 bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full text-xs font-bold">
            <Star size={10} fill="currentColor" />
            {space.rating}
          </div>
        </div>
        <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur text-slate-700 px-2.5 py-1 rounded-full text-xs font-medium">
          <MapPin size={11} />
          {space.distance}
        </div>
      </div>

      <div className="p-5">
        <p className="text-slate-600 text-sm leading-relaxed mb-4">{space.description}</p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {space.benefits.map(b => (
            <span key={b} className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full text-xs font-medium">
              {b}
            </span>
          ))}
        </div>

        <button
          onClick={onToggle}
          className="w-full text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center justify-center gap-1.5 py-2 border border-emerald-200 rounded-xl hover:bg-emerald-50 transition-all"
        >
          {expanded ? 'Less info' : 'Activities & details'}
        </button>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Available Activities</p>
            <div className="grid grid-cols-2 gap-2">
              {space.activities.map(a => (
                <div key={a} className="flex items-center gap-1.5 text-xs text-slate-700 bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-100">
                  <TreePine size={12} className="text-emerald-500 shrink-0" />
                  {a}
                </div>
              ))}
            </div>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noreferrer"
              className="block w-full mt-3 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-xl text-sm font-semibold transition-all text-center"
            >
              Get Directions
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GreenSpaces() {
  const [activeType, setActiveType] = useState('All');
  const [activeMood, setActiveMood] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [dynamicSpaces, setDynamicSpaces] = useState<GreenSpace[] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [lastSource, setLastSource] = useState<string | null>(null);
  const hasLiveResults = Array.isArray(dynamicSpaces) && dynamicSpaces.length > 0;

  const sourceSpaces: GreenSpace[] = hasLiveResults ? dynamicSpaces : greenSpaces;

  const filters = useMemo<string[]>(
    () => ['All', ...Array.from(new Set(sourceSpaces.map((space: GreenSpace) => space.type)))],
    [sourceSpaces],
  );

  const filtered = sourceSpaces.filter((space: GreenSpace) => {
    const typeMatch = activeType === 'All' || space.type === activeType;
    const moodMatch = !activeMood || space.benefits.includes(activeMood);
    return typeMatch && moodMatch;
  });

  const nearestRealPlace = hasLiveResults && sourceSpaces.length > 0 ? sourceSpaces[0] : null;

  const useMyLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported on this browser.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    try {
      const position = await getCurrentPosition();
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      setUserLocation({ lat, lng });
      console.info('[GreenSpaces] User location acquired', { lat, lng });

      const { spaces, endpoint } = await fetchNearbyGreenSpaces(lat, lng);
      setLastSource(endpoint);
      console.info('[GreenSpaces] Live search completed', {
        endpoint,
        count: spaces.length,
        sample: spaces.slice(0, 3).map(space => ({ name: space.name, distance: space.distance })),
      });

      if (spaces.length === 0) {
        setLocationError('No nearby green spaces found around your current location.');
        console.warn('[GreenSpaces] No live places returned for this location', { lat, lng, endpoint });
        return;
      }

      setDynamicSpaces(spaces);
      setExpandedId(null);
      setActiveType('All');
    } catch (error) {
      const message = error instanceof Error
        ? 'Live map providers are busy right now. Please retry in a few seconds.'
        : 'Could not load nearby places.';
      setLocationError(message);
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/30 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Leaf size={14} />
            Nature Therapy
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Green Space Recommendations</h1>
          <p className="text-slate-500 max-w-xl">Discover healing natural environments near you, curated to support your mental and emotional wellbeing.</p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={useMyLocation}
              disabled={isLocating}
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
            >
              {isLocating ? <Loader2 size={16} className="animate-spin" /> : <LocateFixed size={16} />}
              {isLocating ? 'Searching nearby parks...' : 'Use my location'}
            </button>

            {hasLiveResults && (
              <button
                onClick={() => {
                  setDynamicSpaces(null);
                  setActiveType('All');
                  setExpandedId(null);
                }}
                className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              >
                Show demo list
              </button>
            )}

            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${hasLiveResults ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
              {hasLiveResults ? 'Live nearby results' : 'Demo results'}
            </span>
          </div>

          {locationError && (
            <p className="mt-3 text-sm text-rose-600">{locationError}</p>
          )}

          {userLocation && (
            <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-600">
              <p>
                Location used: {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}
              </p>
              <p>
                Data source: {lastSource ?? (hasLiveResults ? 'OpenStreetMap live' : 'Demo dataset')}
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm mb-8">
          <div className="flex items-center gap-2 mb-4 text-slate-700 font-semibold text-sm">
            <Filter size={16} />
            How are you feeling today?
          </div>
          <div className="flex flex-wrap gap-2 mb-5">
            {moodFilters.map(m => (
              <button
                key={m.label}
                onClick={() => setActiveMood(activeMood === m.tag ? null : m.tag)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  activeMood === m.tag
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-700'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Filter by type</p>
            <div className="flex flex-wrap gap-2">
              {filters.map(f => (
                <button
                  key={f}
                  onClick={() => setActiveType(f)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                    activeType === f
                      ? 'bg-teal-500 border-teal-500 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-teal-300'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-5">
          <p className="text-slate-600 font-medium">
            <span className="text-emerald-600 font-bold">{filtered.length}</span> spaces found
            {activeMood && <span className="text-slate-400 ml-1">for "{moodFilters.find(m => m.tag === activeMood)?.label}"</span>}
          </p>
        </div>

        {nearestRealPlace && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 mb-1.5">Nearest Real Place</p>
            <div className="flex flex-wrap items-center gap-2 text-sm text-emerald-900">
              <span className="font-bold">{nearestRealPlace.name}</span>
              <span className="text-emerald-700">({nearestRealPlace.distance})</span>
              {nearestRealPlace.address && <span className="text-emerald-700">- {nearestRealPlace.address}</span>}
            </div>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
            <Leaf size={40} className="mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500 font-medium">No spaces match your current filters.</p>
            <button
              onClick={() => { setActiveType('All'); setActiveMood(null); }}
              className="mt-3 text-emerald-600 text-sm font-semibold hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((space: GreenSpace) => (
              <SpaceCard
                key={space.id}
                space={space}
                expanded={expandedId === space.id}
                onToggle={() => setExpandedId(expandedId === space.id ? null : space.id)}
                userLocation={userLocation}
              />
            ))}
          </div>
        )}

        <div className="mt-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <TreePine size={24} />
            </div>
            <div>
              <h3 className="font-bold text-xl mb-2">The Science of Nature Therapy</h3>
              <p className="text-white/80 text-sm leading-relaxed max-w-2xl">
                Research consistently shows that spending time in natural environments reduces cortisol (stress hormone) levels, lowers blood pressure, and improves mood. Japanese "Shinrin-yoku" (forest bathing) has been scientifically validated to boost immune function and reduce symptoms of anxiety and depression after just 20 minutes of immersion in nature.
              </p>
              <div className="flex flex-wrap gap-4 mt-4">
                {[
                  { value: '20 min', desc: 'to significantly reduce stress hormones' },
                  { value: '2 hrs/wk', desc: 'recommended for measurable mental health benefits' },
                  { value: '30%', desc: 'reduction in depression symptoms reported' },
                ].map(stat => (
                  <div key={stat.value} className="bg-white/10 rounded-xl px-4 py-3">
                    <div className="font-bold text-lg">{stat.value}</div>
                    <div className="text-white/70 text-xs mt-0.5">{stat.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
