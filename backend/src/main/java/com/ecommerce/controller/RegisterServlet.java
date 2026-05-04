package com.ecommerce.controller;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.annotation.MultipartConfig;

import java.io.IOException;

import com.ecommerce.dao.UserDAO;
import com.ecommerce.model.User;

@WebServlet("/register")
@MultipartConfig
public class RegisterServlet extends HttpServlet {

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

    // ✅ FOR BROWSER TESTING
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        setCorsHeaders(res);

        res.setContentType("text/html");
        res.getWriter().println("<h2>Register API is working ✅ (Use POST request)</h2>");
    }

    // ✅ ACTUAL REGISTER LOGIC
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {

        // 🔥 IMPORTANT (must be FIRST line inside doPost)
        req.setCharacterEncoding("UTF-8");
        setCorsHeaders(res);

        res.setContentType("text/plain");

        String email = req.getParameter("email");
        String password = req.getParameter("password");

        // CHECK IF DATA IS NULL (Means Postman is sending raw JSON instead of form data)
        if (email == null || password == null) {
            res.getWriter().println("Registration Failed ❌: 'email' or 'password' is null. If using Postman, select 'x-www-form-urlencoded'. DO NOT use raw JSON.");
            return;
        }

        User user = new User();
        user.setFullName(req.getParameter("fullName"));
        user.setEmail(email);
        user.setPhone(req.getParameter("phone"));
        user.setPassword(password);
        user.setGender(req.getParameter("gender"));
        user.setAddress(req.getParameter("address"));

        UserDAO dao = new UserDAO();
        String status = dao.register(user);

        if ("SUCCESS".equals(status)) {
            res.getWriter().println("Registration Successful ✅");
        } else {
            // Will print the EXACT database error to Postman
            res.getWriter().println("Registration Failed ❌ -> " + status);
        }
    }
}