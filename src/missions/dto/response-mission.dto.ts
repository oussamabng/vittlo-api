import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Mission } from '../entities/mission.entity';

@ObjectType()
export class ResponseMissionDto {
  @Field(() => [Mission], { nullable: true })
  items: Mission[];

  @Field(() => Int, { nullable: true })
  totalCount: number;

  @Field(() => Int, { nullable: true })
  currentPage: number;

  @Field(() => Int, { nullable: true })
  totalPages: number;

  @Field(() => Boolean, { nullable: true })
  hasNextPage: boolean;
}
