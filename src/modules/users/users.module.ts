import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { GetMeHandler } from './handlers/get-me.handler';

const QueryHandlers = [GetMeHandler];

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService, ...QueryHandlers],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}