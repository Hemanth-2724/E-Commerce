package com.ecommerce.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

import com.ecommerce.model.User;
import com.ecommerce.util.DBConnection;

public class UserDAO {

    // REGISTER
    public String register(User user) {
        try {
            Connection conn = DBConnection.getConnection();
            if (conn == null) {
                System.out.println("Database connection failed. Check DBConnection.java");
                return "Database connection failed. Check DBConnection.java";
            }

            String sql = "INSERT INTO users(full_name, email, phone, password, gender, address) VALUES(?,?,?,?,?,?)";

            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setString(1, user.getFullName());
            ps.setString(2, user.getEmail());
            ps.setString(3, user.getPhone());
            ps.setString(4, user.getPassword());
            ps.setString(5, user.getGender());
            ps.setString(6, user.getAddress());

            int row = ps.executeUpdate();

            if (row > 0) {
                return "SUCCESS";
            }
            return "Registration Failed: No rows inserted.";
        } catch (Exception e) {
            System.out.println("Error during registration: " + e.getMessage());
            e.printStackTrace();
            return "DB Error: " + e.getMessage();
        }
    }

    // LOGIN
    public User login(String email, String password) throws Exception {
        User user = null;

        Connection conn = DBConnection.getConnection();
        if (conn == null) {
            System.out.println("Database connection failed. Check DBConnection.java");
            throw new Exception("Database connection failed. Check DBConnection.java");
        }

        String sql = "SELECT * FROM users WHERE email=? AND password=?";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setString(1, email);
        ps.setString(2, password);

        ResultSet rs = ps.executeQuery();

        if (rs.next()) {
            user = new User();
            user.setUserId(rs.getInt("user_id"));
            user.setFullName(rs.getString("full_name"));
            user.setEmail(rs.getString("email"));
        }

        return user;
    }
}