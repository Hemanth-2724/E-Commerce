package com.ecommerce.dao;

import java.sql.*;
import com.ecommerce.model.User;
import com.ecommerce.util.DBConnection;

public class UserDAO {

    public String register(User user) {
        try {
            Connection conn = DBConnection.getConnection();
            if (conn == null) return "Database connection failed.";

            PreparedStatement ps = conn.prepareStatement(
                "INSERT INTO users(full_name, email, phone, password, gender, address) VALUES(?,?,?,?,?,?)");
            ps.setString(1, user.getFullName());
            ps.setString(2, user.getEmail());
            ps.setString(3, user.getPhone());
            ps.setString(4, user.getPassword());
            ps.setString(5, user.getGender());
            ps.setString(6, user.getAddress());

            return ps.executeUpdate() > 0 ? "SUCCESS" : "Registration failed: no rows inserted.";
        } catch (Exception e) {
            e.printStackTrace();
            return "DB Error: " + e.getMessage();
        }
    }

    public User login(String email, String password) throws Exception {
        Connection conn = DBConnection.getConnection();
        if (conn == null) throw new Exception("Database connection failed.");

        PreparedStatement ps = conn.prepareStatement(
            "SELECT * FROM users WHERE email=? AND password=?");
        ps.setString(1, email);
        ps.setString(2, password);
        ResultSet rs = ps.executeQuery();

        if (rs.next()) return mapUser(rs);
        return null;
    }

    public User getUserById(int userId) {
        try {
            Connection conn = DBConnection.getConnection();
            PreparedStatement ps = conn.prepareStatement("SELECT * FROM users WHERE user_id=?");
            ps.setInt(1, userId);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) return mapUser(rs);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    public boolean updateProfile(User user) {
        try {
            Connection conn = DBConnection.getConnection();
            PreparedStatement ps = conn.prepareStatement(
                "UPDATE users SET full_name=?, phone=?, gender=?, address=? WHERE user_id=?");
            ps.setString(1, user.getFullName());
            ps.setString(2, user.getPhone());
            ps.setString(3, user.getGender());
            ps.setString(4, user.getAddress());
            ps.setInt(5, user.getUserId());
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    private User mapUser(ResultSet rs) throws SQLException {
        User u = new User();
        u.setUserId(rs.getInt("user_id"));
        u.setFullName(rs.getString("full_name"));
        u.setEmail(rs.getString("email"));
        u.setPhone(rs.getString("phone"));
        u.setGender(rs.getString("gender"));
        u.setAddress(rs.getString("address"));
        return u;
    }
}