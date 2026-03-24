import { useEffect, useState } from 'react';
import { Calendar, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { fetchStations, StationOption } from '../services/station.service';
import { SearchParams } from '../types';

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
}

export function SearchForm({ onSearch }: SearchFormProps) {
  const [stations, setStations] = useState<StationOption[]>([]);
  const [originId, setOriginId] = useState('');
  const [destinationId, setDestinationId] = useState('');
  const [date, setDate] = useState('');
  const [loadingStations, setLoadingStations] = useState(true);

  useEffect(() => {
    let mounted = true;

    fetchStations()
      .then((stationList) => {
        if (mounted) {
          setStations(stationList);
        }
      })
      .catch((error) => {
        console.error('Failed to load stations:', error);
      })
      .finally(() => {
        if (mounted) {
          setLoadingStations(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (originId && destinationId && date) {
      const originStation = stations.find((station) => station.id === originId);
      const destinationStation = stations.find((station) => station.id === destinationId);
      onSearch({
        originId,
        destinationId,
        date,
        originName: originStation?.name,
        destinationName: destinationStation?.name,
        originCode: originStation?.code,
        destinationCode: destinationStation?.code,
      });
    }
  };

  const today = new Date();
  const minDate = today.toISOString().split('T')[0];

  return (
    <Card className="p-6 shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="from" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Ga di
            </Label>
            <Select value={originId} onValueChange={setOriginId} disabled={loadingStations}>
              <SelectTrigger id="from">
                <SelectValue placeholder={loadingStations ? 'Dang tai danh sach ga...' : 'Chon ga di'} />
              </SelectTrigger>
              <SelectContent>
                {stations.map((station) => (
                  <SelectItem key={station.id} value={station.id} disabled={station.id === destinationId}>
                    {station.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="to" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Ga den
            </Label>
            <Select value={destinationId} onValueChange={setDestinationId} disabled={loadingStations}>
              <SelectTrigger id="to">
                <SelectValue placeholder={loadingStations ? 'Dang tai danh sach ga...' : 'Chon ga den'} />
              </SelectTrigger>
              <SelectContent>
                {stations.map((station) => (
                  <SelectItem key={station.id} value={station.id} disabled={station.id === originId}>
                    {station.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Ngay di
            </Label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={minDate}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </div>
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={loadingStations || !stations.length}>
          Tim chuyen tau
        </Button>
      </form>
    </Card>
  );
}
