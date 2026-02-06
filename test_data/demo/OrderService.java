// Cluster 4: Orders (4 nodes with internal coupling)
package orders;

public class OrderService {
    public Order createOrder(String userId) {
        Order o = buildOrder(userId);
        validateOrder(o);
        processPayment(o);
        logOrder("created", o);
        return o;
    }
    
    public double getTotal(Order o) {
        double total = calculateTotal(o);
        logOrder("total", o);
        return total;
    }
    
    private Order buildOrder(String userId) {
        logOrder("building", null);
        return new Order(userId);
    }
    
    private void validateOrder(Order o) {
        logOrder("validating", o);
    }
    
    private void processPayment(Order o) {
        double total = calculateTotal(o);
        logOrder("payment: " + total, o);
    }
    
    private double calculateTotal(Order o) {
        return 99.99;
    }
    
    private void logOrder(String action, Order o) {
        System.out.println("[ORDER] " + action);
    }
}

class Order {
    String userId;
    Order(String u) { this.userId = u; }
}
