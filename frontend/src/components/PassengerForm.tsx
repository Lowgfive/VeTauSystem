import { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Passenger } from '../types';
import { CheckCircle, Trash2 } from 'lucide-react';
import { useFormValidation, commonRules } from '../hooks/useFormValidation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import {
  PassengerType,
  calculatePassengerFare,
  getChildAgeNotice,
  getPassengerDobError,
} from '../utils/passengerRules';

interface PassengerFormProps {
  passengerNumber: number;
  seatNumber: string;
  seatId: string;
  basePrice: number;
  insuranceFee: number;
  isContactPerson: boolean;
  onPassengerUpdate: (passenger: Passenger) => void;
  onRemoveSeat: () => void;
}

export function PassengerForm({
  passengerNumber,
  seatNumber,
  seatId,
  basePrice,
  insuranceFee,
  isContactPerson,
  onPassengerUpdate,
  onRemoveSeat,
}: PassengerFormProps) {
  const [passenger, setPassenger] = useState<Partial<Passenger>>({
    fullName: '',
    idNumber: '',
    phone: '',
    dateOfBirth: '',
    seatId,
    passengerType: 'Người lớn',
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingType, setPendingType] = useState<PassengerType | null>(null);

  const isChildPassenger = passenger.passengerType === 'Trẻ em';
  const isDobRequired = passenger.passengerType === 'Trẻ em' || passenger.passengerType === 'Người cao tuổi';
  const childAgeNotice = getChildAgeNotice(passenger.passengerType as PassengerType, passenger.dateOfBirth);
  const dobValidationError = isDobRequired
    ? getPassengerDobError(passenger.passengerType as PassengerType, passenger.dateOfBirth)
    : null;

  const { validateSingle, touch, hasError, getError, clearError } = useFormValidation({
    fullName: commonRules.fullName,
    idNumber: isChildPassenger ? commonRules.idNumberChild : commonRules.idNumber,
    phone: {
      ...commonRules.phone,
      required: isContactPerson,
    },
    dateOfBirth: {
      ...commonRules.dateOfBirth,
      custom: (value: string) => getPassengerDobError(passenger.passengerType as PassengerType, value),
    },
  });

  const isComplete = Boolean(
    passenger.fullName &&
      passenger.idNumber &&
      (!isContactPerson || passenger.phone) &&
      (!isDobRequired || passenger.dateOfBirth) &&
      !hasError('fullName') &&
      !hasError('idNumber') &&
      (!isContactPerson || !hasError('phone')) &&
      (!isDobRequired || !hasError('dateOfBirth')) &&
      !dobValidationError
  );

  useEffect(() => {
    onPassengerUpdate(passenger as Passenger);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passenger]);

  const handleChange = (field: keyof Passenger, value: string) => {
    setPassenger((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field: keyof Passenger) => {
    touch(field);
    validateSingle(field, passenger[field] as string);
  };

  const calculateTotal = (type: PassengerType, dateOfBirth?: string) =>
    calculatePassengerFare(basePrice, type, insuranceFee, dateOfBirth);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const canShowChildPrice = !isChildPassenger || Boolean(passenger.dateOfBirth);
  const priceLabel = isChildPassenger && !passenger.dateOfBirth ? 'Nhập ngày sinh để tính giá' : 'Giá vé (đã tính giảm giá)';
  const displayedPrice = canShowChildPrice
    ? formatPrice(calculateTotal(passenger.passengerType as PassengerType, passenger.dateOfBirth))
    : 'Nhập ngày sinh để tính giá';

  const applyPassengerTypeChange = (type: PassengerType) => {
    setPassenger((prev) => ({
      ...prev,
      passengerType: type,
      idNumber: '',
    }));
    clearError('idNumber');
    clearError('dateOfBirth');
  };

  const handleTypeSelect = (value: string) => {
    const type = value as PassengerType;
    if (type === 'Người lớn') {
      applyPassengerTypeChange(type);
      return;
    }

    setPendingType(type);
    setIsDialogOpen(true);
  };

  const confirmTypeChange = () => {
    if (!pendingType) return;

    applyPassengerTypeChange(pendingType);
    setIsDialogOpen(false);
    setPendingType(null);
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
              Miễn vé cho trẻ em dưới 6 tuổi khi đi cùng người lớn và sử dụng chung chỗ với người lớn.
              Mỗi người lớn chỉ được kèm theo một trẻ em miễn vé, từ trẻ em thứ hai trở đi phải mua vé trẻ em.
              <br />
              <br />
              Trẻ em mang quốc tịch Việt Nam từ đủ 6 tuổi đến 10 tuổi được giảm 25% giá vé theo quy định.
            </p>
          )}
          {pendingType === 'Sinh viên' && (
            <p className="text-sm text-slate-700 leading-relaxed">
              Giảm giá vé cho sinh viên, học viên là công dân Việt Nam đang theo học tại các trường dạy nghề,
              trung cấp chuyên nghiệp, cao đẳng, đại học và học viện trên lãnh thổ Việt Nam.
            </p>
          )}
          {pendingType === 'Người cao tuổi' && (
            <p className="text-sm text-slate-700 leading-relaxed">
              Người cao tuổi từ 60 tuổi trở lên được hưởng chính sách giảm giá theo quy định của Tổng công ty
              Đường sắt Việt Nam.
            </p>
          )}

          <p className="text-sm font-medium text-red-600">
            Cảnh báo: Hành khách nhập sai đối tượng được giảm giá sẽ bị phạt theo quy định của ngành đường sắt.
          </p>
        </div>
        <DialogFooter className="flex w-full justify-between sm:justify-between">
          <Button variant="outline" onClick={cancelTypeChange}>
            Hủy
          </Button>
          <Button onClick={confirmTypeChange}>Xác nhận</Button>
        </DialogFooter>
      </>
    );
  };

  const idLabel = isChildPassenger ? 'Số Giấy khai sinh / Hộ chiếu' : 'Số CCCD / CMND / Hộ chiếu';
  const idPlaceholder = isChildPassenger ? 'Số giấy khai sinh hoặc hộ chiếu' : 'Số CMND/CCCD/Hộ chiếu';
  const phoneLabel = isContactPerson ? 'Số điện thoại liên hệ' : 'Số điện thoại (tùy chọn)';
  const phonePlaceholder = isContactPerson ? '0912345678' : 'Không bắt buộc';

  return (
    <Card className="relative border-t-4 border-t-primary p-6">
      <div className="mb-6 flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <span className="font-bold text-primary">{passengerNumber}</span>
          </div>
          <div>
            <h4 className="text-lg font-semibold">Hành khách {passengerNumber}</h4>
            <span className="text-sm font-medium text-slate-500">
              Ghế: <span className="font-bold text-primary">{seatNumber}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isComplete && (
            <div className="flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-sm font-medium text-success">
              <CheckCircle className="h-4 w-4" />
              <span>Hoàn tất</span>
            </div>
          )}
          <button
            onClick={onRemoveSeat}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
            title="Xóa vé"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
          <Label>
            Đối tượng <span className="text-destructive">*</span>
          </Label>
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
            {idLabel} <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`id-${passengerNumber}`}
            value={passenger.idNumber}
            onChange={(e) => handleChange('idNumber', e.target.value)}
            onBlur={() => handleBlur('idNumber')}
            placeholder={idPlaceholder}
            maxLength={isChildPassenger ? 20 : 12}
            className={hasError('idNumber') ? 'border-destructive' : ''}
          />
          {hasError('idNumber') && <p className="text-xs text-destructive">{getError('idNumber')}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor={`phone-${passengerNumber}`}>
            {phoneLabel} {isContactPerson && <span className="text-destructive">*</span>}
          </Label>
          <Input
            id={`phone-${passengerNumber}`}
            type="tel"
            value={passenger.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            onBlur={() => handleBlur('phone')}
            placeholder={phonePlaceholder}
            className={hasError('phone') ? 'border-destructive' : ''}
          />
          {hasError('phone') && <p className="text-xs text-destructive">{getError('phone')}</p>}
          {isContactPerson && <p className="text-xs text-slate-500">Dùng để nhận thông báo vé</p>}
        </div>

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
            {isChildPassenger && childAgeNotice && (
              <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800">
                {childAgeNotice}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-sm font-medium text-slate-500">{priceLabel}</span>
        <span className={`text-lg font-bold ${canShowChildPrice ? 'text-primary' : 'text-amber-700'}`}>
          {displayedPrice}
        </span>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">{renderDialogContent()}</DialogContent>
      </Dialog>
    </Card>
  );
}
