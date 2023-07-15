import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { MissionsService } from './missions.service';
import { DeliveryGuard } from 'src/users/guards/delivery.guard';

@Controller()
export class MissionsController {
  constructor(private readonly missionsService: MissionsService) {}

  @UseGuards(DeliveryGuard)
  @Post('mission/next-order')
  moveToNextOrder(@Body('id') id: number) {
    return this.missionsService.moveToNextOrder(id);
  }
}
