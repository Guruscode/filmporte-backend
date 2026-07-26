import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RegisterCommand } from '../commands/register.command';
import { User } from '../../users/entities/user.entity';
import { AuthResponseDto } from '../dto/auth-response.dto';

@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: RegisterCommand): Promise<AuthResponseDto> {
    const { email, password, firstName, lastName, role } = command.dto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const saltRounds = this.configService.get<number>('bcryptSaltRounds') || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
    });

    await this.userRepository.save(user);

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }
}
