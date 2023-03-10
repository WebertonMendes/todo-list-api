import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

config();

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  host: configService.get('TYPEORM_HOST'),
  port: parseInt(configService.get('TYPEORM_PORT')),
  username: configService.get('TYPEORM_USERNAME'),
  password: configService.get('TYPEORM_PASSWORD'),
  database: configService.get('TYPEORM_DATABASE'),
  entities: [configService.get('TYPEORM_ENTITIES')],
  migrations: [configService.get('TYPEORM_MIGRATIONS')],
  synchronize: false,
  // extra: {
  //   ssl: {
  //     rejectUnauthorized: false
  //   }
  // }
});
