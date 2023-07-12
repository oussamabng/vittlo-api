import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateTrackingInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
