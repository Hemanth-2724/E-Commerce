package com.ecommerce.dao;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

import com.ecommerce.model.CartItem;
import com.ecommerce.model.Order;
import com.ecommerce.util.DBConnection;

public class OrderDAO {

    public boolean placeOrder(int userId, List<CartItem> items, double total,
                               String paymentMethod, String deliveryAddress) {
        try {
            Connection conn = DBConnection.getConnection();

            PreparedStatement ps = conn.prepareStatement(
                "INSERT INTO orders(user_id, total_amount, payment_method, order_status, delivery_address) VALUES(?,?,?,?,?)",
                PreparedStatement.RETURN_GENERATED_KEYS);
            ps.setInt(1, userId);
            ps.setDouble(2, total);
            ps.setString(3, paymentMethod);
            ps.setString(4, "Placed");
            ps.setString(5, deliveryAddress);
            ps.executeUpdate();

            ResultSet rs = ps.getGeneratedKeys();
            if (!rs.next()) return false;
            int orderId = rs.getInt(1);

            for (CartItem item : items) {
                PreparedStatement ps2 = conn.prepareStatement(
                    "INSERT INTO order_items(order_id, product_id, product_name, quantity, unit_price, subtotal, size_label) VALUES(?,?,?,?,?,?,?)");
                ps2.setInt(1, orderId);
                ps2.setInt(2, item.getProductId());
                ps2.setString(3, item.getProductName());
                ps2.setInt(4, item.getQuantity());
                ps2.setDouble(5, item.getUnitPrice());
                ps2.setDouble(6, item.getSubtotal());
                ps2.setString(7, item.getSizeLabel());
                ps2.executeUpdate();
            }
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public List<Order> getOrdersByUser(int userId) {
        List<Order> list = new ArrayList<>();
        try {
            Connection conn = DBConnection.getConnection();
            PreparedStatement ps = conn.prepareStatement(
                "SELECT * FROM orders WHERE user_id=? ORDER BY order_date DESC");
            ps.setInt(1, userId);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                Order o = new Order();
                o.setOrderId(rs.getInt("order_id"));
                o.setTotalAmount(rs.getDouble("total_amount"));
                o.setOrderStatus(rs.getString("order_status"));
                o.setOrderDate(rs.getString("order_date"));
                o.setPaymentMethod(rs.getString("payment_method"));
                o.setDeliveryAddress(rs.getString("delivery_address"));
                list.add(o);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    // FIX: verify the order belongs to the user before returning items
    public List<CartItem> getOrderItems(int orderId, int userId) {
        List<CartItem> list = new ArrayList<>();
        try {
            Connection conn = DBConnection.getConnection();
            PreparedStatement ps = conn.prepareStatement(
                "SELECT oi.*, p.image_url FROM order_items oi " +
                "JOIN orders o ON oi.order_id = o.order_id " +
                "LEFT JOIN products p ON oi.product_id = p.product_id " +
                "WHERE oi.order_id=? AND o.user_id=?");
            ps.setInt(1, orderId);
            ps.setInt(2, userId);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                CartItem item = new CartItem();
                item.setProductId(rs.getInt("product_id"));
                item.setProductName(rs.getString("product_name"));
                item.setQuantity(rs.getInt("quantity"));
                item.setUnitPrice(rs.getDouble("unit_price"));
                item.setSizeLabel(rs.getString("size_label"));
                item.setImageUrl(rs.getString("image_url"));
                list.add(item);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    public boolean cancelOrder(int orderId, int userId) {
        try {
            Connection conn = DBConnection.getConnection();
            PreparedStatement ps = conn.prepareStatement(
                "UPDATE orders SET order_status = 'Cancelled' WHERE order_id = ? AND user_id = ? AND order_status IN ('Placed', 'Pending')");
            ps.setInt(1, orderId);
            ps.setInt(2, userId);
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean updateOrderAddress(int orderId, int userId, String newAddress) {
        try {
            Connection conn = DBConnection.getConnection();
            PreparedStatement ps = conn.prepareStatement(
                "UPDATE orders SET delivery_address = ? WHERE order_id = ? AND user_id = ? AND order_status IN ('Placed', 'Pending')");
            ps.setString(1, newAddress);
            ps.setInt(2, orderId);
            ps.setInt(3, userId);
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}