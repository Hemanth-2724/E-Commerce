package com.ecommerce.dao;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

import com.ecommerce.util.DBConnection;
import com.ecommerce.model.CartItem;

public class CartDAO {

    public String addToCart(int userId, int productId, int quantity, double price, String sizeLabel) {
        try {
            Connection conn = DBConnection.getConnection();
            if (conn == null) return "Database connection failed.";

            // 1. Get or create cart for this user
            int cartId = -1;
            PreparedStatement checkPs = conn.prepareStatement("SELECT cart_id FROM cart WHERE user_id = ?");
            checkPs.setInt(1, userId);
            ResultSet rs = checkPs.executeQuery();

            if (rs.next()) {
                cartId = rs.getInt("cart_id");
            } else {
                PreparedStatement createPs = conn.prepareStatement(
                        "INSERT INTO cart(user_id) VALUES(?)", Statement.RETURN_GENERATED_KEYS);
                createPs.setInt(1, userId);
                createPs.executeUpdate();
                ResultSet keys = createPs.getGeneratedKeys();
                if (keys.next()) cartId = keys.getInt(1);
                else return "Failed to create cart.";
            }

            // 2. Check if same product+size already in cart → update quantity
            PreparedStatement existPs = conn.prepareStatement(
                    "SELECT cart_item_id, quantity FROM cart_items WHERE cart_id=? AND product_id=? AND size_label=?");
            existPs.setInt(1, cartId);
            existPs.setInt(2, productId);
            existPs.setString(3, sizeLabel);
            ResultSet existRs = existPs.executeQuery();

            if (existRs.next()) {
                int newQty = existRs.getInt("quantity") + quantity;
                PreparedStatement updatePs = conn.prepareStatement(
                        "UPDATE cart_items SET quantity=? WHERE cart_item_id=?");
                updatePs.setInt(1, newQty);
                updatePs.setInt(2, existRs.getInt("cart_item_id"));
                updatePs.executeUpdate();
            } else {
                PreparedStatement insertPs = conn.prepareStatement(
                        "INSERT INTO cart_items(cart_id, product_id, size_label, quantity, unit_price) VALUES(?,?,?,?,?)");
                insertPs.setInt(1, cartId);
                insertPs.setInt(2, productId);
                insertPs.setString(3, sizeLabel);
                insertPs.setInt(4, quantity);
                insertPs.setDouble(5, price);
                insertPs.executeUpdate();
            }

            return "SUCCESS";
        } catch (Exception e) {
            e.printStackTrace();
            return "DB Error: " + e.getMessage();
        }
    }

    // FIX: column name was "item_id" but DB has "cart_item_id"
    // Also JOINs product table to return name + imageUrl
    public List<CartItem> getCartItems(int userId) {
        List<CartItem> list = new ArrayList<>();
        try {
            Connection conn = DBConnection.getConnection();
            if (conn == null) return list;

            String sql =
                "SELECT ci.cart_item_id, ci.cart_id, ci.product_id, ci.size_label, " +
                "       ci.quantity, ci.unit_price, " +
                "       p.product_name, p.image_url, p.discount_percent " +
                "FROM cart_items ci " +
                "JOIN cart c ON ci.cart_id = c.cart_id " +
                "JOIN products p ON ci.product_id = p.product_id " +
                "WHERE c.user_id = ?";

            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setInt(1, userId);
            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                CartItem item = new CartItem();
                item.setItemId(rs.getInt("cart_item_id"));      // FIX: was "item_id"
                item.setCartId(rs.getInt("cart_id"));
                item.setProductId(rs.getInt("product_id"));
                item.setSizeLabel(rs.getString("size_label"));
                item.setQuantity(rs.getInt("quantity"));
                item.setUnitPrice(rs.getDouble("unit_price"));
                item.setProductName(rs.getString("product_name"));
                item.setImageUrl(rs.getString("image_url"));
                item.setDiscountPercent(rs.getDouble("discount_percent"));
                list.add(item);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    public boolean removeItem(int cartItemId, int userId) {
        try {
            Connection conn = DBConnection.getConnection();
            // Verify the item belongs to the user's cart before deleting
            PreparedStatement ps = conn.prepareStatement(
                "DELETE ci FROM cart_items ci " +
                "JOIN cart c ON ci.cart_id = c.cart_id " +
                "WHERE ci.cart_item_id = ? AND c.user_id = ?");
            ps.setInt(1, cartItemId);
            ps.setInt(2, userId);
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean clearCart(int userId) {
        try {
            Connection conn = DBConnection.getConnection();
            PreparedStatement ps = conn.prepareStatement(
                "DELETE ci FROM cart_items ci " +
                "JOIN cart c ON ci.cart_id = c.cart_id " +
                "WHERE c.user_id = ?");
            ps.setInt(1, userId);
            ps.executeUpdate();
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}