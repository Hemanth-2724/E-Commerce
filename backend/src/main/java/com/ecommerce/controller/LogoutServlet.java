package com.ecommerce.controller;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import jakarta.servlet.annotation.WebServlet;

import java.io.IOException;

@WebServlet("/logout")
public class LogoutServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        res.setContentType("application/json;charset=UTF-8");

        HttpSession session = req.getSession(false);
        if (session != null) session.invalidate();

        res.getWriter().print("{\"success\":true,\"message\":\"Logged out successfully\"}");
    }
}