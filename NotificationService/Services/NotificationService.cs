using Microsoft.Extensions.Options;
using MongoDB.Driver;
using NotificationService.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NotificationService.Services
{
    public class NotificationService : INotificationService
    {
        private readonly IMongoCollection<Notification> _notificationsCollection;

        public NotificationService(IOptions<MongoDbSettings> mongoDbSettings)
        {
            var mongoClient = new MongoClient(mongoDbSettings.Value.ConnectionString);
            var mongoDatabase = mongoClient.GetDatabase(mongoDbSettings.Value.DatabaseName);
            _notificationsCollection = mongoDatabase.GetCollection<Notification>(mongoDbSettings.Value.CollectionName);
        }

        public async Task<Notification> CreateNotificationAsync(Notification notification)
        {
            await _notificationsCollection.InsertOneAsync(notification);
            return notification;
        }

        public async Task<List<Notification>> GetAllNotificationsAsync() =>
            await _notificationsCollection.Find(_ => true).SortByDescending(n => n.CreatedAt).ToListAsync();

        public async Task<List<Notification>> GetUnreadNotificationsAsync(string? recipientId = null)
        {
            var filter = Builders<Notification>.Filter.Eq(n => n.IsRead, false);
            if (!string.IsNullOrEmpty(recipientId))
            {
                filter &= Builders<Notification>.Filter.Eq(n => n.RecipientId, recipientId);
            }
            return await _notificationsCollection.Find(filter).SortByDescending(n => n.CreatedAt).ToListAsync();
        }

        public async Task<Notification?> GetNotificationByIdAsync(string id) =>
            await _notificationsCollection.Find(n => n.Id == id).FirstOrDefaultAsync();

        public async Task UpdateNotificationAsync(string id, Notification updatedNotification) =>
            await _notificationsCollection.ReplaceOneAsync(n => n.Id == id, updatedNotification);

        public async Task MarkAsReadAsync(string id)
        {
            var update = Builders<Notification>.Update.Set(n => n.IsRead, true);
            await _notificationsCollection.UpdateOneAsync(n => n.Id == id, update);
        }

        public async Task MarkAllAsReadAsync(string? recipientId = null)
        {
            var filter = Builders<Notification>.Filter.Eq(n => n.IsRead, false);
            if (!string.IsNullOrEmpty(recipientId))
            {
                filter &= Builders<Notification>.Filter.Eq(n => n.RecipientId, recipientId);
            }
            var update = Builders<Notification>.Update.Set(n => n.IsRead, true);
            await _notificationsCollection.UpdateManyAsync(filter, update);
        }


        public async Task DeleteNotificationAsync(string id) =>
            await _notificationsCollection.DeleteOneAsync(n => n.Id == id);
    }
}