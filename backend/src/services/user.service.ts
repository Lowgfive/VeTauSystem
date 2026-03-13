import UserModel, { IUser } from "../models/user.model";
import { AppError } from "../middlewares/error.middleware";

export const getProfileService = async (userId: string) => {
    const user = await UserModel.findById(userId);
    if (!user) {
        throw new AppError(404, "Không tìm thấy người dùng");
    }
    return user;
};

export const updateProfileService = async (userId: string, targetData: Partial<IUser>) => {
    // Only allow specific fields to be updated
    const updateData: Partial<IUser> = {};
    if (targetData.name !== undefined) updateData.name = targetData.name;
    if (targetData.phone !== undefined) updateData.phone = targetData.phone;
    if (targetData.cccd !== undefined) updateData.cccd = targetData.cccd;

    const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
    );

    if (!updatedUser) {
        throw new AppError(404, "Không tìm thấy người dùng");
    }

    return updatedUser;
};
