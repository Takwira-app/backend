import { Controller } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Get, Post, Param, Req, Delete, ParseIntPipe,Body } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { sendNotificationDTO } from './dto/send-notification.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) {}


    @Get()
    getUserNotifications(@Req() req) {
    return this.notificationsService.getNotifications(req.user.id);
    }

    @Post('create')
    createNotification(@Req() req,@Body() body: { title: string; message: string }) {
        return this.notificationsService.createNotification(req.user.id, body.title, body.message);}

    @Post()
    sendNotification(@Body() pushNotification: sendNotificationDTO) {
       return this.notificationsService.sendPush(pushNotification);
    }

    @Post('/mark-read/:id')
    markRead(@Param('id') id: number, @Req() req) {
    return this.notificationsService.markAsRead(id, req.user.id);
    }

    @Post('save-token')
    saveToken(@Req() req, @Body() body: { token: string }) {
        return this.notificationsService.saveToken(req.user.id, body.token);
    }

    @Delete('read')
    deleteAllRead(@Req() req) {
        return this.notificationsService.deleteAllRead(req.user.id);
    }

    @Delete(':id')
    deleteNotification(
        @Param('id', ParseIntPipe) id: number,
        @Req() req
    ) {
        return this.notificationsService.deleteNotification(id, req.user.id);
    }

   

    
}
