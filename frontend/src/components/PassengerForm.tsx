import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Passenger } from '../types';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useFormValidation, commonRules } from '../hooks/useFormValidation';

interface PassengerFormProps {
  passengerNumber: number;
  seatNumber: string;
  seatId: string;
  onPassengerUpdate: (passenger: Passenger) => void;
}

export function PassengerForm({ passengerNumber, seatNumber, seatId, onPassengerUpdate }: PassengerFormProps) {
  const [passenger, setPassenger] = useState<Partial<Passenger>>({
    fullName: '',
    idNumber: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    seatId: seatId
  });

  const { errors, touched, validateSingle, touch, hasError, getError } = useFormValidation({
    fullName: commonRules.fullName,
    idNumber: commonRules.idNumber,
    phone: commonRules.phone,
    email: commonRules.email,
    dateOfBirth: commonRules.dateOfBirth,
  });

  const isComplete = passenger.fullName && 
    passenger.idNumber && 
    passenger.phone && 
    passenger.email && 
    passenger.dateOfBirth &&
    !hasError('fullName') &&
    !hasError('idNumber') &&
    !hasError('phone') &&
    !hasError('email') &&
    !hasError('dateOfBirth');

  useEffect(() => {
    if (isComplete) {
      onPassengerUpdate(passenger as Passenger);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete, passenger]);

  const handleChange = (field: keyof Passenger, value: string) => {
    const updated = { ...passenger, [field]: value };
    setPassenger(updated);
  };

  const handleBlur = (field: keyof Passenger) => {
    touch(field);
    validateSingle(field, passenger[field]);
  };

  return (
    <Card className="p-6 relative">
      {/* Completion Badge */}
      {isComplete && (
        <div className="absolute top-4 right-4">
          <div className="flex items-center gap-2 text-success text-sm font-medium bg-success/10 px-3 py-1 rounded-full">
            <CheckCircle className="w-4 h-4" />
            <span>Hoàn tất</span>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-primary font-bold">{passengerNumber}</span>
        </div>
        <div>
          <h4 className="font-semibold text-lg">Hành khách {passengerNumber}</h4>
          <span className="text-sm text-primary font-medium">Ghế: {seatNumber}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`name-${passengerNumber}`}>
            Họ và tên <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`name-${passengerNumber}`}
            value={passenger.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            onBlur={() => handleBlur('fullName')}
            placeholder="Nguyễn Văn A"
            className={hasError('fullName') ? 'border-destructive' : ''}
            required
          />
          {hasError('fullName') && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {getError('fullName')}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor={`id-${passengerNumber}`}>
            Số CMND/CCCD <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`id-${passengerNumber}`}
            value={passenger.idNumber}
            onChange={(e) => handleChange('idNumber', e.target.value)}
            onBlur={() => handleBlur('idNumber')}
            placeholder="001234567890"
            maxLength={12}
            className={hasError('idNumber') ? 'border-destructive' : ''}
            required
          />
          {hasError('idNumber') && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {getError('idNumber')}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor={`phone-${passengerNumber}`}>
            Số điện thoại <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`phone-${passengerNumber}`}
            type="tel"
            value={passenger.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            onBlur={() => handleBlur('phone')}
            placeholder="0912345678"
            className={hasError('phone') ? 'border-destructive' : ''}
            required
          />
          {hasError('phone') && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {getError('phone')}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor={`email-${passengerNumber}`}>
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`email-${passengerNumber}`}
            type="email"
            value={passenger.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            placeholder="example@email.com"
            className={hasError('email') ? 'border-destructive' : ''}
            required
          />
          {hasError('email') && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {getError('email')}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor={`dob-${passengerNumber}`}>
            Ngày sinh <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`dob-${passengerNumber}`}
            type="date"
            value={passenger.dateOfBirth}
            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
            onBlur={() => handleBlur('dateOfBirth')}
            max={new Date().toISOString().split('T')[0]}
            className={hasError('dateOfBirth') ? 'border-destructive' : ''}
            required
          />
          {hasError('dateOfBirth') && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {getError('dateOfBirth')}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}