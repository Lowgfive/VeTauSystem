import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import { Booking } from "../types";
import { Train, Calendar, Clock, MapPin, User, Hash, CreditCard, QrCode } from "lucide-react";
import { formatCurrency, formatDate } from "../utils/formatters";
import { Badge } from "./ui/badge";

interface TicketDetailModalProps {
    booking: Booking | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCancelTicket?: (id: string) => void;
    onChangeTicket?: (code: string) => void;
}

export function TicketDetailModal({ 
    booking, 
    open, 
    onOpenChange,
    onCancelTicket,
    onChangeTicket
}: TicketDetailModalProps) {
    if (!booking) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl p-0 overflow-y-auto max-h-[90vh] border-0 shadow-2xl bg-white rounded-3xl">
                {/* Header section with blue background */}
                <div className="bg-gradient-to-r from-blue-700 to-blue-600 p-6 text-white text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                    <div className="relative z-10">
                        <DialogTitle className="text-2xl font-black uppercase tracking-[0.2em]">
                            Vé tàu điện tử
                        </DialogTitle>
                        <p className="text-blue-100/80 text-xs font-bold mt-1 tracking-widest uppercase italic">Electronic Train Ticket</p>
                    </div>
                </div>

                <div className="p-6 md:p-10">
                    <div className="bg-slate-50 rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-inner relative">
                        {/* The "Perforated" line effect */}
                        <div className="absolute left-0 right-0 top-[28%] border-t-2 border-dashed border-slate-300 z-10" />
                        <div className="absolute left-[-12px] top-[28%] -translate-y-1/2 w-6 h-6 bg-white rounded-full border border-slate-200 shadow-[inset_-2px_0_4px_rgba(0,0,0,0.05)] z-20" />
                        <div className="absolute right-[-12px] top-[28%] -translate-y-1/2 w-6 h-6 bg-white rounded-full border border-slate-200 shadow-[inset_2px_0_4px_rgba(0,0,0,0.05)] z-20" />

                        {/* Top: Train & Code */}
                        <div className="p-8 pb-10 bg-white">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center border-2 border-blue-50">
                                        <Train className="w-8 h-8 text-blue-700" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mã hiệu tàu / Train Code</div>
                                        <div className="text-3xl font-black text-slate-900 tracking-tight">{booking.trainNumber}</div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mã đặt chỗ / Booking ID</div>
                                    <div className="text-2xl font-mono font-black text-blue-700 bg-blue-50 px-4 py-1.5 rounded-lg border border-blue-100">
                                        {booking.bookingCode}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Middle: Journey Details */}
                        <div className="p-8 pt-12 pb-12 bg-slate-50 relative">
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                                {/* Origin */}
                                <div className="text-center md:text-left">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ga đi / Origin</div>
                                    <div className="text-2xl font-black text-slate-800 leading-tight mb-2">{booking.route.origin}</div>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-center md:justify-start gap-2 text-sm font-bold text-slate-600">
                                            <Calendar className="w-4 h-4 text-blue-500" />
                                            {formatDate(booking.departureDateTime)}
                                        </div>
                                        <div className="flex items-center justify-center md:justify-start gap-2 text-sm font-black text-blue-700">
                                            <Clock className="w-4 h-4 text-blue-500" />
                                            {booking.departureTime}
                                        </div>
                                    </div>
                                </div>

                                {/* Visual Arrow */}
                                <div className="flex flex-col items-center justify-center px-4 relative">
                                    <div className="w-full h-[2px] bg-slate-200 hidden md:block" />
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-50 p-2">
                                        <QrCode className="w-12 h-12 text-blue-700/20" />
                                    </div>
                                </div>

                                {/* Destination */}
                                <div className="text-center md:text-right">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ga đến / Destination</div>
                                    <div className="text-2xl font-black text-slate-800 leading-tight mb-2">{booking.route.destination}</div>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-center md:justify-end gap-2 text-sm font-bold text-slate-600">
                                            <Calendar className="w-4 h-4 text-blue-500" />
                                            {formatDate(booking.arrivalDateTime)}
                                        </div>
                                        <div className="flex items-center justify-center md:justify-end gap-2 text-sm font-black text-slate-800">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                            {booking.arrivalTime}
                                        </div>
                                    </div>
                                </div>
                             </div>
                        </div>

                        {/* Bottom: Passenger & Seat Map */}
                        <div className="p-8 bg-white border-t border-slate-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <User className="w-5 h-5 text-slate-600" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hành khách / Passenger</div>
                                            <div className="text-lg font-black text-slate-900 uppercase">
                                                {booking.passengers?.[0]?.fullName || "Hệ thống - Khách"}
                                            </div>
                                            <div className="text-xs text-slate-500 font-bold uppercase tracking-tighter">CMND: {booking.passengers?.[0]?.idNumber || "N/A"}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <Hash className="w-5 h-5 text-slate-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vị trí ghế / Seat Numbers</div>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {booking.seats.length > 0 ? (
                                                    booking.seats.map(s => (
                                                        <Badge key={s._id} variant="outline" className="px-3 py-1 font-mono text-sm font-black bg-blue-50 text-blue-700 border-blue-100">
                                                            {s.seat_number}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">Chưa cập nhật vị trí ghế</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <CreditCard className="w-5 h-5 text-slate-600" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Thanh toán / Payment</div>
                                            <div className="text-2xl font-black text-blue-700 leading-none">
                                                {formatCurrency(booking.totalAmount)}
                                            </div>
                                            <div className="mt-2">
                                                <Badge className={
                                                    booking.status === 'paid' ? "bg-emerald-500" :
                                                    booking.status === 'pending' ? "bg-amber-500" :
                                                    booking.status === 'cancelled' ? "bg-red-500" : "bg-blue-500"
                                                }>
                                                    {booking.status === 'paid' ? 'Đã thanh toán' :
                                                     booking.status === 'cancelled' ? 'Đã hủy' : 'Đang xử lý'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                        <div className="flex items-center gap-3 mb-2">
                                            <QrCode className="w-5 h-5 text-slate-400" />
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Digital Signature</span>
                                        </div>
                                        <div className="text-[10px] font-mono text-slate-400 break-all leading-tight">
                                            SIGNATURE: {Math.random().toString(36).substring(2).toUpperCase()} - {booking.bookingCode} - VRTS
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-2">
                        {booking.status !== 'cancelled' && (
                            <>
                                <button 
                                    onClick={() => onChangeTicket?.(booking.bookingCode)}
                                    className="flex-1 py-4 bg-white hover:bg-slate-50 text-slate-700 font-black uppercase text-xs tracking-widest border-2 border-slate-200 rounded-2xl transition-all flex items-center justify-center gap-2 hover:border-blue-300 active:scale-[0.98]"
                                >
                                    <Hash className="w-4 h-4 text-blue-500" />
                                    Đổi vé
                                </button>
                                <button 
                                    onClick={() => onCancelTicket?.(booking.id)}
                                    className="flex-1 py-4 bg-white hover:bg-red-50 text-red-600 font-black uppercase text-xs tracking-widest border-2 border-red-100 rounded-2xl transition-all flex items-center justify-center gap-2 hover:border-red-200 active:scale-[0.98]"
                                >
                                    <Hash className="w-4 h-4 text-red-500" />
                                    Hủy vé
                                </button>
                            </>
                        )}
                        <button 
                            className="flex-1 py-4 bg-blue-700 hover:bg-blue-800 text-white font-black uppercase text-xs tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                        >
                            <QrCode className="w-4 h-4" />
                            Tải vé PDF
                        </button>
                    </div>

                    <div className="mt-8 text-center space-y-2">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">Hệ thống đường sắt Việt Nam</p>
                        <p className="text-[9px] text-slate-400 italic italic font-medium">* Vui lòng có mặt tại ga ít nhất 20 phút trước khi khởi hành.</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
