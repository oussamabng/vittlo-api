import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { LoginAdmin } from './dto/login-admin.dto';
import { VerifyOtp } from './dto/verify-otp.dto';
import { RefreshGuard } from './guards/refresh.guard';
import { CurrentUserId } from './interceptors/current-user-id.decorator';

@Controller('')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('delivery/sign-in')
  loginDelivery(@Body() loginAdmin: LoginAdmin) {
    return this.usersService.loginDelivery(loginAdmin);
  }

  @Post('delivery/verify-otp')
  verifyOtpDelivery(@Body() verifyOtp: VerifyOtp) {
    return this.usersService.verifyOtpDelivery(verifyOtp);
  }

  @UseGuards(RefreshGuard)
  @Post('refresh-token')
  refreshToken(@CurrentUserId() userId: number) {
    return this.usersService.refreshAccessToken(userId);
  }
}
