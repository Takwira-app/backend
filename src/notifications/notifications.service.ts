import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as firebase from 'firebase-admin';
import { sendNotificationDTO } from './dto/send-notification.dto';
import admin from '../firebase/firebase-admin';

@Injectable()
export class NotificationsService {

    constructor(private prisma: PrismaService) {}

    async sendPush(notification: sendNotificationDTO) {
    try {
      await firebase
        .messaging()
        .send({
          notification: {
            title: notification.title,
            body: notification.message,},
          token: notification.deviceId,
          data: {},
          android: {
            priority: 'high',
            notification: {
              sound: 'default',
              channelId: 'default',
            },
          },
          apns: {
            headers: {
              'apns-priority': '10',
            },
            payload: {
              aps: {
                contentAvailable: true,
                sound: 'default',
              },
            },
          },
        })
        .catch((error: any) => {
          console.error(error);
        });
    } catch (error) {
      console.log(error);
      return error;
    }
  }


    async saveToken(userId: number, token: string) {
        return this.prisma.users.update({
            where: { user_id: userId },
            data:{
                fcm_token: token,
            }
        });
        }



    async getNotifications(userId: number) {
        return this.prisma.notifications.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' },
        });
    }

    async createNotification(userId: number, title: string, message: string) {

        await this.prisma.notifications.create({
            data: { user_id: userId, title, message }
        });

        const user = await this.prisma.users.findUnique({
            where: { user_id: userId },
            select: { fcm_token: true },
        });
        if(!user?.fcm_token){
            return { success: true, message: "No FCM token for user" };
        }

        try {
            await admin.messaging().send({
            token: user.fcm_token,
            notification: {
                title: title,
                body: message,},
                data: {userId: userId.toString()},
            });
            console.log("FCM sent to user:", userId);
        } catch (err) {
            console.error("Error sending FCM", err);
        }

        return { success: true };
        }


    async markAsRead(id: number, userId: number) {
            const notification = await this.prisma.notifications.findUnique({
            where: { notification_id: id },
            });

            if (!notification) {
            throw new NotFoundException('Notification not found');
            }

            if (notification.user_id !== userId) {
            throw new ForbiddenException('This notification does not belong to you');
            }

            // Marquer comme lue
            return this.prisma.notifications.update({
            where: { notification_id: id },
            data: { 
                is_read: true,}
            });
     
   }

    async deleteNotification(notificationId: number, userId: number) {
        const notification = await this.prisma.notifications.findUnique({
        where: { notification_id: notificationId },
        });

        if (!notification) {
        throw new NotFoundException('Notification not found');
        }

        if (notification.user_id !== userId) {
        throw new ForbiddenException('This notification does not belong to you');
        }

        return this.prisma.notifications.delete({
        where: { notification_id: notificationId }
        });
    }

    async deleteAllRead(userId: number) {
        return this.prisma.notifications.deleteMany({
        where: { 
            user_id: userId,
            is_read: true 
        }
        });
    }
}
