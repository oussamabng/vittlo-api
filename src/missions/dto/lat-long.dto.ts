import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Double } from 'typeorm';

@ObjectType()
export class LatLongDto {
  @Field(() => Number, { nullable: true })
  latitude: number;

  @Field(() => Number, { nullable: true })
  longitude: number;
}
