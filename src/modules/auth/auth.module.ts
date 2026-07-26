import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterHandler } from './handlers/register.handler';
import { LoginHandler } from './handlers/login.handler';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User } from '../users/entities/user.entity';

const CommandHandlers = [RegisterHandler, LoginHandler];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  JwtModule.registerAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
      const secret = configService.get<string>('jwt.secret');
      const expiresIn = configService.get<string>('jwt.expiresIn') || '1d';

      return {
        secret: secret || 'default-secret',
        signOptions: {
          expiresIn: expiresIn as any, 
        },
      };
    },
  }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, ...CommandHandlers],
  exports: [JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}