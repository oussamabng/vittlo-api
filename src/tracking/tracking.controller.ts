import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { TrackingService } from './tracking.service';

@Controller('')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Get('order/tracking')
  getOrderTracking(@Body('trackingCode') trackingCode: string) {
    return this.trackingService.getOrderTrackingByCode(trackingCode);
  }
}
