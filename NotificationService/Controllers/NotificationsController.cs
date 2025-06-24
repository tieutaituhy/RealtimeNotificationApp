using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using NotificationService.Hubs;
using NotificationService.Models;
using NotificationService.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NotificationService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationService _notificationService;
        private readonly IHubContext<NotificationHub> _hubContext;

        public NotificationsController(INotificationService notificationService, IHubContext<NotificationHub> hubContext)
        {
            _notificationService = notificationService;
            _hubContext = hubContext;
        }

        [HttpGet]
        public async Task<ActionResult<List<Notification>>> Get() =>
            await _notificationService.GetAllNotificationsAsync();

        [HttpGet("unread")]
        public async Task<ActionResult<List<Notification>>> GetUnread([FromQuery] string? recipientId) =>
            await _notificationService.GetUnreadNotificationsAsync(recipientId);

        [HttpGet("{id:length(24)}")]
        public async Task<ActionResult<Notification>> Get(string id)
        {
            var notification = await _notificationService.GetNotificationByIdAsync(id);
            if (notification is null)
            {
                return NotFound();
            }
            return notification;
        }

        [HttpPost]
        public async Task<IActionResult> Post(Notification newNotification)
        {
            // Set CreatedAt nếu chưa có
            if (newNotification.CreatedAt == default(DateTime))
            {
                newNotification.CreatedAt = DateTime.UtcNow;
            }
            newNotification.IsRead = false; // Đảm bảo thông báo mới là chưa đọc

            await _notificationService.CreateNotificationAsync(newNotification);

            // Gửi thông báo qua SignalR ngay sau khi tạo
            await _hubContext.Clients.All.SendAsync("ReceiveNotification", newNotification);

            return CreatedAtAction(nameof(Get), new { id = newNotification.Id }, newNotification);
        }

        [HttpPut("{id:length(24)}/mark-as-read")]
        public async Task<IActionResult> MarkAsRead(string id)
        {
            var notification = await _notificationService.GetNotificationByIdAsync(id);
            if (notification is null)
            {
                return NotFound();
            }

            await _notificationService.MarkAsReadAsync(id);
            return NoContent();
        }

        [HttpPut("mark-all-as-read")]
        public async Task<IActionResult> MarkAllAsRead([FromQuery] string? recipientId)
        {
            await _notificationService.MarkAllAsReadAsync(recipientId);
            return NoContent();
        }


        [HttpDelete("{id:length(24)}")]
        public async Task<IActionResult> Delete(string id)
        {
            var notification = await _notificationService.GetNotificationByIdAsync(id);
            if (notification is null)
            {
                return NotFound();
            }

            await _notificationService.DeleteNotificationAsync(id);
            return NoContent();
        }
    }
}