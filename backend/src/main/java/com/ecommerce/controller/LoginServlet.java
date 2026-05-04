package com.ecommerce.controller;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.annotation.MultipartConfig;

import java.io.IOException;
import java.io.PrintWriter;

import com.ecommerce.dao.UserDAO;
import com.ecommerce.model.User;

@WebServlet("/login")
@MultipartConfig
public class LoginServlet extends HttpServlet {

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

    // 👉 For browser testing (GET)
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        setCorsHeaders(res);

        res.setContentType("text/html;charset=UTF-8");
        res.getWriter().println("<h2>Login API is working ✅ (Use POST request)</h2>");
    }

    // 👉 Actual login (POST)
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {

        // Important for proper encoding
        req.setCharacterEncoding("UTF-8");
        setCorsHeaders(res);

        res.setContentType("text/plain;charset=UTF-8");
        PrintWriter out = res.getWriter();

        String email = req.getParameter("email");
        String password = req.getParameter("password");

        // CHECK IF DATA IS NULL
        if (email == null || password == null) {
            out.println("Invalid Credentials ❌: 'email' or 'password' is null. If using Postman, select 'x-www-form-urlencoded'. DO NOT use raw JSON.");
            return;
        }

        UserDAO dao = new UserDAO();
        try {
            User user = dao.login(email, password);
            if (user != null) {
                HttpSession session = req.getSession();
                session.setAttribute("user", user);
                out.println("Login Success ✅");
            } else {
                out.println("Invalid Credentials ❌ -> Incorrect email or password.");
            }
        } catch (Exception e) {
            out.println("Login Error ❌ -> " + e.getMessage());
        }
    }
}