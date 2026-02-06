// Cluster 2: Database (4 nodes with internal coupling)
package database;

public class DatabaseService {
    public Object query(String sql) {
        logQuery(sql);
        return executeQuery(sql);
    }
    
    public boolean insert(String table, Object data) {
        String sql = buildInsert(table, data);
        logQuery(sql);
        return query(sql) != null;
    }
    
    public boolean update(String table, Object data) {
        String sql = buildUpdate(table, data);
        logQuery(sql);
        return query(sql) != null;
    }
    
    private Object executeQuery(String sql) {
        logQuery("EXEC: " + sql);
        return new Object();
    }
    
    private String buildInsert(String table, Object data) {
        return "INSERT INTO " + table + " VALUES (" + data + ")";
    }
    
    private String buildUpdate(String table, Object data) {
        return "UPDATE " + table + " SET " + data;
    }
    
    private void logQuery(String sql) {
        System.out.println("[DB] " + sql);
    }
}
