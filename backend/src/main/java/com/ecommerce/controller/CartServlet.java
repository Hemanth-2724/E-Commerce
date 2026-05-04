package com.ecommerce.controller;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import jakarta.servlet.annotation.WebServlet;

import java.io.IOException;
import java.util.List;
import com.google.gson.Gson;

import com.ecommerce.dao.CartDAO;
import com.ecommerce.model.User;
import com.ecommerce.model.CartItem;

@WebServlet("/cart")
public class CartServlet extends HttpServlet {

    // Helper method to setup CORS for React frontend
    private void setCorsHeaders(HttpServletResponse res) {
        res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
        res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        res.setHeader("Access-Control-Allow-Credentials", "true");
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        setCorsHeaders(res);
        res.setStatus(HttpServletResponse.SC_OK);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {

        setCorsHeaders(res);
        res.setContentType("application/json");

        HttpSession session = req.getSession(false);
        if (session == null || session.getAttribute("user") == null) {
            // Return empty cart if the user is not logged in
            res.getWriter().print("[]");
            return;
        }
        
        User user = (User) session.getAttribute("user");
        int userId = user.getUserId();

        CartDAO dao = new CartDAO();
        List<CartItem> items = dao.getCartItems(userId);

        // Debug log to your Tomcat Server Console
        System.out.println("Fetching cart for User ID: " + userId + " | Items found: " + items.size());

        Gson gson = new Gson();
        res.getWriter().print(gson.toJson(items));
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {

        setCorsHeaders(res);

        try {
            String productIdParam = req.getParameter("productId");
            String quantityParam = req.getParameter("quantity");
            String priceParam = req.getParameter("price");

            // Prevent NumberFormatException if data is missing
            if (productIdParam == null || quantityParam == null || priceParam == null) {
                res.getWriter().println("Failed ❌: Missing product details.");
                return;
            }

            HttpSession session = req.getSession(false);
            if (session == null || session.getAttribute("user") == null) {
                res.getWriter().println("Failed ❌: You must be logged in to add items.");
                return;
            }
            
            User user = (User) session.getAttribute("user");
            int userId = user.getUserId();

            int productId = Integer.parseInt(productIdParam);
            int quantity = Integer.parseInt(quantityParam);
            double price = Double.parseDouble(priceParam);

            CartDAO dao = new CartDAO();
            String status = dao.addToCart(userId, productId, quantity, price);

            if ("SUCCESS".equals(status)) {
                res.getWriter().println("Added to Cart ✅");
            } else {
                res.getWriter().println("Failed ❌ -> " + status);
            }
        } catch (Exception e) {
            res.getWriter().println("Error ❌: " + e.getMessage());
        }
    }
}