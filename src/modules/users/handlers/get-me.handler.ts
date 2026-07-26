import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetMeQuery } from '../queries/get-me.query';
import { User } from '../entities/user.entity';

@QueryHandler(GetMeQuery)
export class GetMeHandler implements IQueryHandler<GetMeQuery> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async execute(query: GetMeQuery): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: query.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}