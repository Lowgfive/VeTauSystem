import { useState } from 'react';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { stations } from '../data/mockData';
import { SearchParams } from '../types';

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
}

export function SearchForm({ onSearch }: SearchFormProps) {
  const [originId, setOriginId] = useState('');
  const [destinationId, setDestinationId] = useState('');
  const [date, setDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (originId && destinationId && date) {
      const originStation = stations.find((s) => s.id === originId);
      const destinationStation = stations.find((s) => s.id === destinationId);
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

  // Get today's date as minimum date
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];

  return (
    <Card className="p-6 shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="from" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Ga đi
            </Label>
            <Select value={originId} onValueChange={setOriginId}>
              <SelectTrigger id="from">
                <SelectValue placeholder="Chọn ga đi" />
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
              Ga đến
            </Label>
            <Select value={destinationId} onValueChange={setDestinationId}>
              <SelectTrigger id="to">
                <SelectValue placeholder="Chọn ga đến" />
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
              Ngày đi
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

        <Button type="submit" className="w-full" size="lg">
          Tìm chuyến tàu
        </Button>
      </form>
    </Card>
  );
}