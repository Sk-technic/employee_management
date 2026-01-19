import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';

export const mongoConfig = (
  configService: ConfigService,
): MongooseModuleOptions => ({
  uri: configService.get<string>('MONGO_URI'),
  autoIndex: true,
  connectionFactory: (connection) => {
    console.log('✅ MongoDB Connected');
    return connection;
  },
});
