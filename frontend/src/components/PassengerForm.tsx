import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Passenger } from '../types';
import { CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { useFormValidation, commonRules } from '../hooks/useFormValidation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';

interface PassengerFormProps {
  passengerNumber: number;
  seatNumber: string;
  seatId: string;
  basePrice: number;
  insuranceFee: number;
  onPassengerUpdate: (passenger: Passenger) => void;
  onRemoveSeat: () => void;
}

type PassengerType = 'Người lớn' | 'Trẻ em' | 'Sinh viên' | 'Người cao tuổi';

export function PassengerForm({ 
  passengerNumber, 
  seatNumber, 
  seatId, 
  basePrice,
  insuranceFee,
  onPassengerUpdate,
  onRemoveSeat
}: PassengerFormProps) {
  const [passenger, setPassenger] = useState<Partial<Passenger>>({
    fullName: '',
    idNumber: '',
    phone: '',
    dateOfBirth: '',
    seatId: seatId,
    passengerType: 'Người lớn'
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingType, setPendingType] = useState<PassengerType | null>(null);

  const { errors, touched, validateSingle, touch, hasError, getError } = useFormValidation({
    fullName: commonRules.fullName,
    idNumber: commonRules.idNumber,
    phone: commonRules.phone,
    dateOfBirth: commonRules.dateOfBirth,
  });

  const isDobRequired = passenger.passengerType === 'Trẻ em' || passenger.passengerType === 'Người cao tuổi';

  const isComplete = passenger.fullName && 
    passenger.idNumber && 
    passenger.phone && 
    (!isDobRequired || passenger.dateOfBirth) &&
    !hasError('fullName') &&
    !hasError('idNumber') &&
    !hasError('phone') &&
    (!isDobRequired || !hasError('dateOfBirth'));

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
    validateSingle(field, passenger[field] as string);
  };

  const calculateTotal = (type: PassengerType) => {
    let discountRate = 0;
    if (type === 'Trẻ em') discountRate = 0.25;
    if (type === 'Sinh viên') discountRate = 0.1;
    if (type === 'Người cao tuổi') discountRate = 0.15;
    return (basePrice * (1 - discountRate)) + insuranceFee;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleTypeSelect = (value: string) => {
    const type = value as PassengerType;
    if (type === 'Người lớn') {
      handleChange('passengerType', type);
    } else {
      setPendingType(type);
      setIsDialogOpen(true);
    }
  };

  const confirmTypeChange = () => {
    if (pendingType) {
      handleChange('passengerType', pendingType);
      setIsDialogOpen(false);
      setPendingType(null);
    }
  };

  const cancelTypeChange = () => {
    setIsDialogOpen(false);
    setPendingType(null);
  };

  const renderDialogContent = () => {
    if (!pendingType) return null;

    return (
      <>
        <DialogHeader>
          <DialogTitle>
            {pendingType === 'Trẻ em' && 'Ngày tháng năm sinh'}
            {pendingType === 'Sinh viên' && 'Ưu đãi Sinh viên'}
            {pendingType === 'Người cao tuổi' && 'Ngày tháng năm sinh'}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {pendingType === 'Trẻ em' && (
            <p className="text-sm text-slate-700 leading-relaxed">
              Miễn vé cho trẻ em dưới 6 tuổi khi đi cùng người lớn và sử dụng chung chỗ với người lớn. Mỗi người lớn chỉ được kèm theo một trẻ em miễn vé, từ trẻ em thứ hai trở đi phải mua vé trẻ em.<br/><br/>
              Trẻ em mang quốc tịch Việt Nam từ đủ 6 tuổi đến 10 tuổi được giảm 25% giá vé theo quy định.
            </p>
          )}
          {pendingType === 'Sinh viên' && (
            <p className="text-sm text-slate-700 leading-relaxed">
              Giảm giá vé cho sinh viên, học viên là công dân Việt Nam đang theo học tại các trường Dạy nghề, Trung cấp chuyên nghiệp; các trường Cao đẳng, Đại học, Học viện trên lãnh thổ Việt Nam (Không bao gồm học viên học sau đại học)
            </p>
          )}
          {pendingType === 'Người cao tuổi' && (
            <p className="text-sm text-slate-700 leading-relaxed">
              Người cao tuổi (người từ 60 tuổi trở lên) được hưởng chính sách giảm giá theo quy định của Tổng công ty Đường sắt Việt Nam.
            </p>
          )}

          <p className="text-sm text-red-600 font-medium">
            Cảnh báo: Hành khách nhập sai đối tượng được giảm giá sẽ bị phạt theo quy định của ngành đường sắt.
          </p>

        </div>
        <DialogFooter className="flex justify-between sm:justify-between w-full">
          <Button variant="outline" onClick={cancelTypeChange}>Hủy</Button>
          <Button onClick={confirmTypeChange}>Xác nhận</Button>
        </DialogFooter>
      </>
    );
  };

  return (
    <Card className="p-6 relative border-t-4 border-t-primary">
      {/* Header with Passenger Number, Seat, and Trash Icon */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold">{passengerNumber}</span>
          </div>
          <div>
            <h4 className="font-semibold text-lg">Hành khách {passengerNumber}</h4>
            <span className="text-sm font-medium text-slate-500">
              Ghế: <span className="text-primary font-bold">{seatNumber}</span>
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
            {isComplete && (
              <div className="flex items-center gap-2 text-success text-sm font-medium bg-success/10 px-3 py-1 rounded-full">
                <CheckCircle className="w-4 h-4" />
                <span>Hoàn tất</span>
              </div>
            )}
            <button 
                onClick={onRemoveSeat}
                className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                title="Xóa vé"
            >
                <Trash2 size={20} />
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
          />
          {hasError('fullName') && <p className="text-xs text-destructive">{getError('fullName')}</p>}
        </div>

        <div className="space-y-2">
          <Label>Đối tượng <span className="text-destructive">*</span></Label>
          <Select value={passenger.passengerType} onValueChange={handleTypeSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn đối tượng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Người lớn">Người lớn</SelectItem>
              <SelectItem value="Trẻ em">Trẻ em</SelectItem>
              <SelectItem value="Sinh viên">Sinh viên</SelectItem>
              <SelectItem value="Người cao tuổi">Người cao tuổi</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`id-${passengerNumber}`}>
            Số Giấy tờ <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`id-${passengerNumber}`}
            value={passenger.idNumber}
            onChange={(e) => handleChange('idNumber', e.target.value)}
            onBlur={() => handleBlur('idNumber')}
            placeholder="Số CMND/CCCD/Hộ chiếu"
            maxLength={12}
            className={hasError('idNumber') ? 'border-destructive' : ''}
          />
          {hasError('idNumber') && <p className="text-xs text-destructive">{getError('idNumber')}</p>}
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
          />
          {hasError('phone') && <p className="text-xs text-destructive">{getError('phone')}</p>}
        </div>
        
        {/* Dynamic fields */}
        {isDobRequired && (
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
            />
            {hasError('dateOfBirth') && <p className="text-xs text-destructive">{getError('dateOfBirth')}</p>}
            </div>
        )}

      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
        <span className="text-sm font-medium text-slate-500">Giá vé (đã tính giảm giá)</span>
        <span className="text-lg font-bold text-primary">
          {formatPrice(calculateTotal(passenger.passengerType as PassengerType))}
        </span>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          {renderDialogContent()}
        </DialogContent>
      </Dialog>
    </Card>
  );
}