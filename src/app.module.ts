import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';


@Module({
  imports: [UserModule,
    ConfigModule.forRoot({
      isGlobal:true
    }),
    DatabaseModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
