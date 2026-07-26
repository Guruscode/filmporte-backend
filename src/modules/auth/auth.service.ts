import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterCommand } from './commands/register.command';
import { LoginCommand } from './commands/login.command';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(private readonly commandBus: CommandBus) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    return this.commandBus.execute(new RegisterCommand(dto));
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    return this.commandBus.execute(new LoginCommand(dto));
  }
}
