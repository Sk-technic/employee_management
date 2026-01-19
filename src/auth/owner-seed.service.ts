import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { User, UserDocument, UserRole } from './schema/user.schema';

@Injectable()
export class OwnerSeedService implements OnModuleInit {
  private readonly logger = new Logger(OwnerSeedService.name);

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly configService: ConfigService,   
  ) {}

  async onModuleInit() {
    await this.createOwnerIfNotExists();
  }

  private async createOwnerIfNotExists() {
    const existingOwner = await this.userModel.findOne({ role: UserRole.OWNER });

    if (existingOwner) {
      this.logger.log('OWNER already exists. Skipping seed.');
      return;
    }

    const owner = await this.userModel.create({
      name: this.configService.getOrThrow('OWNER_NAME'),
      email: this.configService.getOrThrow('OWNER_EMAIL'),
      password: this.configService.getOrThrow('OWNER_PASSWORD'),
      role: UserRole.OWNER,
    });

    this.logger.log(`OWNER created successfully → ${owner.email}`);
  }
}
