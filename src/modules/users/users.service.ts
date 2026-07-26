import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetMeQuery } from './queries/get-me.query';

@Injectable()
export class UsersService {
  constructor(private readonly queryBus: QueryBus) {}

  getMe(userId: string) {
    return this.queryBus.execute(new GetMeQuery(userId));
  }
}
