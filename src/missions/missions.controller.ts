import { Controller, Get } from '@nestjs/common';
import { MissionsService } from './missions.service';

@Controller()
export class MissionsController {
  constructor(private readonly missionsService: MissionsService) {}

/*   @Get('missions')
  getAll() {
    return this.missionsService.findAll();
  } */
}
