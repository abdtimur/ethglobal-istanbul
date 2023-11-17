import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomConfig } from './config/interfaces';
import { DataSource } from 'typeorm';

const GlobalConfigModule = ConfigModule.forRoot({
  envFilePath:
    '.env' +
    (process.env.NODE_ENV != 'production' ? '.' + process.env.NODE_ENV : ''),
  isGlobal: true,
  load: [configuration],
});

const DatabaseModule = TypeOrmModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (configService: ConfigService) =>
    configService.get(CustomConfig.dbConfig),
  dataSourceFactory: async (options) => {
    const dataSource = new DataSource(options);
    try {
      await dataSource.initialize();
      // Running all pending migrations
      await dataSource.runMigrations({ transaction: 'all' });
    } catch (e) {
      console.error(`Error while trying to connect to DB: ${e}`);
    }
    return dataSource;
  },
});

@Module({
  imports: [GlobalConfigModule, DatabaseModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
