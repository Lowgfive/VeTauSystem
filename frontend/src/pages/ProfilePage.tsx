import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile, UpdateProfileInput } from "../services/user.service";
import { Footer } from "../components/Footer";

// Radix/shadcn UI components
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "../components/ui/card";
import { toast } from "sonner";
import { Loader2, User as UserIcon, ArrowLeft, Wallet } from "lucide-react";

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  cccd: string;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await getProfile();
      if (res.success && res.data) {
        reset({
          name: res.data.name || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
          cccd: res.data.cccd || "",
        });
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lỗi khi tải thông tin hồ sơ");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setSaving(true);
      const payload: UpdateProfileInput = {
        name: data.name,
        phone: data.phone,
        cccd: data.cccd,
      };

      const res = await updateProfile(payload);
      if (res.success) {
        toast.success("Cập nhật hồ sơ thành công!");
      }
    } catch (error: any) {
      // API error map to toast
      const msg = error?.response?.data?.message || "Lỗi khi cập nhật hồ sơ";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50/50">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-zinc-900 pb-20">
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex flex-col space-y-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="w-fit -ml-2 text-gray-600 hover:text-primary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-primary/10 rounded-full">
                  <UserIcon className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                  Hồ sơ cá nhân
                </h1>
              </div>
              <Button onClick={() => navigate("/wallet")} variant="outline" className="gap-2 shadow-sm border-2">
                <Wallet className="w-4 h-4 text-primary" />
                Ví của tôi
              </Button>
            </div>
          </div>

          <Card className="border-none shadow-md overflow-hidden dark:bg-zinc-800">
            <CardHeader className="bg-slate-50 dark:bg-zinc-950/50 border-b pb-6">
              <CardTitle className="text-xl">Thông tin chi tiết</CardTitle>
              <CardDescription className="text-sm">
                Quản lý thông tin cá nhân của bạn, bao gồm CCCD để xuất vé nhanh chóng.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-6 pt-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Tên */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">Họ và tên</Label>
                    <Input
                      id="name"
                      placeholder="Nguyễn Văn A"
                      className="bg-white dark:bg-zinc-900"
                      {...register("name", { required: "Họ và tên là bắt buộc" })}
                    />
                    {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email (Không thể thay đổi)</Label>
                    <Input
                      id="email"
                      type="email"
                      disabled
                      className="bg-gray-100 cursor-not-allowed dark:bg-zinc-800 text-gray-500"
                      {...register("email")}
                    />
                  </div>

                  {/* SĐT */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">Số điện thoại</Label>
                    <Input
                      id="phone"
                      placeholder="0912345678"
                      className="bg-white dark:bg-zinc-900"
                      {...register("phone", {
                        pattern: {
                          value: /(84|0[3|5|7|8|9])+([0-9]{8})\b/,
                          message: "Số điện thoại không hợp lệ",
                        },
                      })}
                    />
                    {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                  </div>

                  {/* CCCD */}
                  <div className="space-y-2">
                    <Label htmlFor="cccd" className="text-sm font-medium">CMND / CCCD</Label>
                    <Input
                      id="cccd"
                      placeholder="012345678901"
                      className="bg-white dark:bg-zinc-900"
                      {...register("cccd", {
                        pattern: {
                          value: /^[0-9]{9,12}$/,
                          message: "CCCD/CMND phải từ 9 đến 12 số",
                        },
                      })}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      (Bắt buộc khi đặt vé để xác nhận danh tính)
                    </p>
                    {errors.cccd && <p className="text-sm text-red-500">{errors.cccd.message}</p>}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="bg-slate-50 dark:bg-zinc-950/50 pt-5 rounded-b-xl flex justify-end">
                <Button 
                  type="submit" 
                  disabled={saving || loading}
                  className="w-full sm:w-auto min-w-[140px]"
                >
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
