

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument, UserRole } from '../schema/user.schema';


@Injectable()
export class AuthRepository {
    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,
    ) { }


    async createUser(data: {
        name: string;
        email: string;
        password: string;
        role?: UserRole;
    }): Promise<User> {
        const user = new this.userModel(data);
        return user.save();
    }

    async findByEmail(email: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ email }).exec();
    }


    async findById(userId: string | Types.ObjectId): Promise<User | null> {
        return this.userModel.findById(userId).select('-password').exec();
    }

    async updateRefreshToken(
        userId: string | Types.ObjectId,
        refreshToken: string,
    ): Promise<void> {
        await this.userModel.updateOne(
            { _id: userId },
            { refreshToken },
        );
    }
    async clearRefreshToken(userId: string | Types.ObjectId): Promise<void> {
        await this.userModel.updateOne(
            { _id: userId },
            { $unset: { refreshToken: 1 } },
        );
    }

    async findByRefreshToken(refreshToken: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ refreshToken }).exec();
    }

    async emailExists(email: string): Promise<boolean> {
        const count = await this.userModel.countDocuments({ email });
        return count > 0;
    }

}