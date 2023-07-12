import { CreateTrackingInput } from './create-tracking.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateTrackingInput extends PartialType(CreateTrackingInput) {
  @Field(() => Int)
  id: number;
}
