const Notification = require('../models/Notification');

class NotificationService {
  // Create a new notification
  static async createNotification(notificationData) {
    try {
      const notification = new Notification(notificationData);
      await notification.save();
      
      // Populate sender info for real-time emission
      await notification.populate('sender', 'name role');
      
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Notify student about new assignment
  static async notifyNewAssignment(assignment, teacher, studentIds) {
    const notifications = studentIds.map(studentId => ({
      recipient: studentId,
      sender: teacher._id,
      type: 'new_assignment',
      title: 'New Assignment Posted',
      message: `${teacher.name} posted a new assignment: ${assignment.title}`,
      relatedEntity: {
        entityType: 'assignment',
        entityId: assignment._id
      },
      priority: 'high'
    }));

    await Notification.insertMany(notifications);
    return notifications;
  }

  // Notify teacher about new submission
  static async notifyNewSubmission(submission, student, assignment) {
    return await this.createNotification({
      recipient: assignment.createdBy,
      sender: student._id,
      type: 'submission_received',
      title: 'Assignment Submitted',
      message: `${student.name} submitted assignment: ${assignment.title}`,
      relatedEntity: {
        entityType: 'submission',
        entityId: submission._id
      },
      priority: 'medium'
    });
  }

  // Notify student about grade
  static async notifyAssignmentGraded(assignment, teacher, studentId, grade) {
    return await this.createNotification({
      recipient: studentId,
      sender: teacher._id,
      type: 'assignment_graded',
      title: 'Assignment Graded',
      message: `${teacher.name} graded your assignment: ${assignment.title} - Grade: ${grade}`,
      relatedEntity: {
        entityType: 'assignment',
        entityId: assignment._id
      },
      priority: 'medium'
    });
  }

  // Notify about new message
  static async notifyNewMessage(message, sender, recipientId) {
    return await this.createNotification({
      recipient: recipientId,
      sender: sender._id,
      type: 'new_message',
      title: 'New Message',
      message: `New message from ${sender.name}: ${message.content.substring(0, 50)}...`,
      relatedEntity: {
        entityType: 'chat',
        entityId: message.chat
      },
      priority: 'medium'
    });
  }
}

module.exports = NotificationService;