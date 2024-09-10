import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";

@Module({
imports:[
TypeOrmModule.forRootAsync({
    imports: [ConfigModule],
    useFactory: (configService: ConfigService) => ({
      type: 'mysql',
      host: configService.getOrThrow('HOST'),
      port: +configService.getOrThrow('PORT'),
      username: configService.getOrThrow('DB_USERNAME'),
      password: configService.getOrThrow('DB_PASSWORD'),
      database: configService.getOrThrow('DB_NAME'),
      autoLoadEntities: true,
      synchronize: true,
    }),
    inject: [ConfigService]
  }),
  ]
})

export class DatabaseModule{}