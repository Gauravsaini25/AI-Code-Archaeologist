// Cluster 1: Authentication (4 nodes with internal coupling)
package auth;

public class AuthService {
    public boolean login(String user, String pass) {
        boolean valid = validateUser(user);
        boolean passOk = checkPassword(pass);
        logAttempt(user, valid && passOk);
        return valid && passOk;
    }
    
    public boolean logout(String token) {
        logAttempt("logout", true);
        return invalidateToken(token);
    }
    
    private boolean validateUser(String user) {
        logAttempt(user, true);
        return user != null && user.length() > 0;
    }
    
    private boolean checkPassword(String pass) {
        return pass != null && pass.length() >= 6;
    }
    
    private boolean invalidateToken(String token) {
        logAttempt("invalidate", true);
        return true;
    }
    
    private void logAttempt(String action, boolean success) {
        System.out.println("[AUTH] " + action + ": " + success);
    }
}
