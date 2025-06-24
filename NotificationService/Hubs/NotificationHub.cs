using Microsoft.AspNetCore.SignalR;
using NotificationService.Models;
using NotificationService.Services;
using System.Threading.Tasks;

namespace NotificationService.Hubs
{
    public class NotificationHub : Hub
    {
        private readonly INotificationService _notificationService;

        public NotificationHub(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        // Phương thức để server gửi thông báo tới tất cả client
        public async Task SendNotification(Notification notification)
        {
            await Clients.All.SendAsync("ReceiveNotification", notification);
        }

        // Phương thức client có thể gọi để tạo thông báo mới
        // (Trong ứng dụng thực tế, việc tạo thông báo thường từ một service hoặc admin)
        public async Task CreateAndSendNotification(string title, string message, string? recipientId = null)
        {
            var newNotification = new Notification
            {
                Title = title,
                Message = message,
                RecipientId = recipientId,
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };
            await _notificationService.CreateNotificationAsync(newNotification);
            await Clients.All.SendAsync("ReceiveNotification", newNotification); // Gửi thông báo tới tất cả client
        }

        // Có thể thêm các phương thức khác như:
        // - SendNotificationToUser(string userId, Notification notification)
        // - MarkAsRead(string notificationId)
        // ...
    }
}