using NotificationService.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NotificationService.Services
{
    public interface INotificationService
    {
        Task<Notification> CreateNotificationAsync(Notification notification);
        Task<List<Notification>> GetAllNotificationsAsync();
        Task<List<Notification>> GetUnreadNotificationsAsync(string? recipientId = null);
        Task<Notification?> GetNotificationByIdAsync(string id);
        Task UpdateNotificationAsync(string id, Notification updatedNotification);
        Task MarkAsReadAsync(string id);
        Task MarkAllAsReadAsync(string? recipientId = null);
        Task DeleteNotificationAsync(string id);
    }
}