package com.ecommerce.dao;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

import com.ecommerce.model.Product;
import com.ecommerce.util.DBConnection;

public class ProductDAO {

    public List<Product> getAllProducts() {
        List<Product> list = new ArrayList<>();

        try {
            Connection conn = DBConnection.getConnection();

            String sql = "SELECT * FROM products";
            PreparedStatement ps = conn.prepareStatement(sql);

            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                Product p = new Product();

                p.setProductId(rs.getInt("product_id"));
                p.setProductName(rs.getString("product_name"));
                p.setDescription(rs.getString("description"));
                p.setPrice(rs.getDouble("price"));
                p.setImageUrl(rs.getString("image_url"));
                p.setDiscountPercent(rs.getDouble("discount_percent"));
                p.setCategoryId(rs.getInt("category_id"));
                p.setGenderCategory(rs.getString("gender_category"));

                list.add(p);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return list;
    }

    public Product getProductById(int id) {
    Product p = null;

    try {
        Connection conn = DBConnection.getConnection();
        String sql = "SELECT * FROM products WHERE product_id=?";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setInt(1, id);

        ResultSet rs = ps.executeQuery();

        if (rs.next()) {
            p = new Product();
            p.setProductId(rs.getInt("product_id"));
            p.setProductName(rs.getString("product_name"));
            p.setDescription(rs.getString("description"));
            p.setPrice(rs.getDouble("price"));
            p.setImageUrl(rs.getString("image_url"));
            p.setDiscountPercent(rs.getDouble("discount_percent"));
            p.setCategoryId(rs.getInt("category_id"));
            p.setGenderCategory(rs.getString("gender_category"));
        }

    } catch (Exception e) {
        e.printStackTrace();
    }

    return p;
}
}