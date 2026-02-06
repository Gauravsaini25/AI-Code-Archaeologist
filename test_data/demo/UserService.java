// Cluster 3: Users (4 nodes with internal coupling)
package users;

public class UserService {
    public User findUser(String id) {
        User cached = loadFromCache(id);
        if (cached != null) {
            logAction("cache hit", id);
            return cached;
        }
        return loadFromDatabase(id);
    }
    
    public User createUser(String email) {
        User u = buildUser(email);
        saveToDatabase(u);
        logAction("created", email);
        return u;
    }
    
    private User loadFromCache(String id) {
        logAction("cache lookup", id);
        return new User(id);
    }
    
    private User loadFromDatabase(String id) {
        logAction("db lookup", id);
        return new User(id);
    }
    
    private User buildUser(String email) {
        return new User(email);
    }
    
    private void saveToDatabase(User u) {
        logAction("save", u.toString());
    }
    
    private void logAction(String action, String detail) {
        System.out.println("[USER] " + action + ": " + detail);
    }
}

class User {
    String email;
    User(String e) { this.email = e; }
    public String toString() { return email; }
}
