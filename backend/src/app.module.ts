import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomConfig } from './config/interfaces';
import { DataSource } from 'typeorm';
import { ZoomModule } from './zoom/zoom.module';
import { MentorsModule } from './mentors/mentors.module';
import { TimeslotsModule } from './timeslots/timeslots.module';

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
  imports: [
    GlobalConfigModule,
    DatabaseModule,
    ZoomModule,
    MentorsModule,
    TimeslotsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
