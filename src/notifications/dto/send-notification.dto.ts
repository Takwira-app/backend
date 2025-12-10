import { IsString } from "class-validator";

export class sendNotificationDTO {
  @IsString()
  title: string;
  @IsString()
  message: string;
  @IsString()
  deviceId: string;
}