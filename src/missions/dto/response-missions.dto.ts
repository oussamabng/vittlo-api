import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Mission } from '../entities/mission.entity';

@ObjectType()
export class ResponseMissionDto {
  @Field(() => [Mission], { nullable: true })
  items: Mission[];

  @Field(() => String, { nullable: true })
  startingAdress: number;

  @Field(() => String, { nullable: true })
  endingAdress: string;

  @Field(() => Int, { nullable: true })
  numberOfOrders: number;
}
