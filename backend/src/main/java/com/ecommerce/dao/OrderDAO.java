package com.ecommerce.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

import com.ecommerce.model.CartItem;
import com.ecommerce.model.Order;
import com.ecommerce.util.DBConnection;

public class OrderDAO {

    public boolean placeOrder(int userId, List<CartItem> items, double total) {
        boolean status = false;

        try {
            Connection conn = DBConnection.getConnection();

            // Insert order
            String orderSql = "INSERT INTO orders(user_id, total_amount, payment_method, order_status) VALUES(?,?,?,?)";
            PreparedStatement ps = conn.prepareStatement(orderSql, PreparedStatement.RETURN_GENERATED_KEYS);

            ps.setInt(1, userId);
            ps.setDouble(2, total);
            ps.setString(3, "COD");
            ps.setString(4, "Placed");

            ps.executeUpdate();

            ResultSet rs = ps.getGeneratedKeys();
            int orderId = 0;
            if (rs.next()) orderId = rs.getInt(1);

            // Insert order items
            for (CartItem item : items) {
                String itemSql = "INSERT INTO order_items(order_id, product_id, quantity, unit_price, subtotal) VALUES(?,?,?,?,?)";
                PreparedStatement ps2 = conn.prepareStatement(itemSql);

                ps2.setInt(1, orderId);
                ps2.setInt(2, item.getProductId());
                ps2.setInt(3, item.getQuantity());
                ps2.setDouble(4, item.getUnitPrice());
                ps2.setDouble(5, item.getQuantity() * item.getUnitPrice());

                ps2.executeUpdate();
            }

            status = true;

        } catch (Exception e) {
            e.printStackTrace();
        }

        return status;
    }

    public List<Order> getOrdersByUser(int userId) {
        List<Order> list = new ArrayList<>();

        try {
            Connection conn = DBConnection.getConnection();

            String sql = "SELECT * FROM orders WHERE user_id=?";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setInt(1, userId);

            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                Order o = new Order();
                o.setOrderId(rs.getInt("order_id"));
                o.setTotalAmount(rs.getDouble("total_amount"));
                o.setOrderStatus(rs.getString("order_status"));
                o.setOrderDate(rs.getString("order_date"));

                list.add(o);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return list;
    }

    public List<CartItem> getOrderItems(int orderId) {
        List<CartItem> list = new ArrayList<>();

        try {
            Connection conn = DBConnection.getConnection();

            String sql = "SELECT * FROM order_items WHERE order_id=?";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setInt(1, orderId);

            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                CartItem item = new CartItem();

                item.setProductId(rs.getInt("product_id"));
                item.setQuantity(rs.getInt("quantity"));
                item.setUnitPrice(rs.getDouble("unit_price"));

                list.add(item);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return list;
    }
}