// Cluster 5: Notifications (4 nodes with internal coupling)
package notifications;

public class NotificationService {
    public void sendEmail(String to, String msg) {
        String formatted = formatMessage(msg);
        validate(to);
        deliver(to, formatted);
        logNotification("email", to);
    }
    
    public void sendSMS(String phone, String msg) {
        String formatted = formatMessage(msg);
        validate(phone);
        deliverSMS(phone, formatted);
        logNotification("sms", phone);
    }
    
    private String formatMessage(String msg) {
        logNotification("format", msg);
        return "[NOTIFICATION] " + msg;
    }
    
    private void validate(String recipient) {
        logNotification("validate", recipient);
    }
    
    private void deliver(String to, String msg) {
        logNotification("deliver", to);
        System.out.println("Email to " + to + ": " + msg);
    }
    
    private void deliverSMS(String phone, String msg) {
        logNotification("sms deliver", phone);
        System.out.println("SMS to " + phone + ": " + msg);
    }
    
    private void logNotification(String type, String detail) {
        System.out.println("[NOTIFY] " + type + ": " + detail);
    }
}
