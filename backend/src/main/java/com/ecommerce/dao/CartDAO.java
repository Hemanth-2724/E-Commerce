package com.ecommerce.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import com.ecommerce.util.DBConnection;
import com.ecommerce.model.CartItem;

public class CartDAO {

    public String addToCart(int userId, int productId, int quantity, double price) {
        try {
            Connection conn = DBConnection.getConnection();
            if (conn == null) {
                return "Database connection failed.";
            }

            // 1. Get or create a cart for this user
            int cartId = -1;
            String checkCartSql = "SELECT cart_id FROM cart WHERE user_id = ?";
            PreparedStatement checkCartPs = conn.prepareStatement(checkCartSql);
            checkCartPs.setInt(1, userId);
            ResultSet rs = checkCartPs.executeQuery();

            if (rs.next()) {
                cartId = rs.getInt("cart_id");
            } else {
                // Create new cart for the user
                String createCartSql = "INSERT INTO cart(user_id) VALUES(?)";
                PreparedStatement createCartPs = conn.prepareStatement(createCartSql, Statement.RETURN_GENERATED_KEYS);
                createCartPs.setInt(1, userId);
                createCartPs.executeUpdate();
                ResultSet keys = createCartPs.getGeneratedKeys();
                if (keys.next()) {
                    cartId = keys.getInt(1);
                } else {
                    return "Failed to create a new cart.";
                }
            }

            String sql = "INSERT INTO cart_items(cart_id, product_id, quantity, unit_price) VALUES(?,?,?,?)";

            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setInt(1, cartId);
            ps.setInt(2, productId);
            ps.setInt(3, quantity);
            ps.setDouble(4, price);

            int row = ps.executeUpdate();
            if (row > 0) {
                return "SUCCESS";
            }
            return "Failed to insert into cart_items.";

        } catch (Exception e) {
            e.printStackTrace();
            return "DB Error: " + e.getMessage();
        }
    }

    // Retrieve Cart Items for a specific User
    public List<CartItem> getCartItems(int userId) {
        List<CartItem> list = new ArrayList<>();
        
        try {
            Connection conn = DBConnection.getConnection();
            if (conn == null) return list;

            // Get the user's cart items
            String sql = "SELECT ci.* FROM cart_items ci " +
                         "JOIN cart c ON ci.cart_id = c.cart_id " +
                         "WHERE c.user_id = ?";

            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setInt(1, userId);
            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                CartItem item = new CartItem();
                item.setItemId(rs.getInt("item_id"));
                item.setCartId(rs.getInt("cart_id"));
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