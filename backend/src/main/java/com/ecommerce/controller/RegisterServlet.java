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

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        res.setContentType("application/json");
        res.getWriter().print("{\"message\":\"Register API is up\"}");
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        req.setCharacterEncoding("UTF-8");
        res.setContentType("application/json;charset=UTF-8");

        String email    = req.getParameter("email");
        String password = req.getParameter("password");

        if (email == null || password == null) {
            res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            res.getWriter().print("{\"error\":\"Email and password are required.\"}");
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
            res.getWriter().print("{\"success\":true,\"message\":\"Registration Successful\"}");
        } else {
            res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            res.getWriter().print("{\"error\":\"" + status.replace("\"", "'") + "\"}");
        }
    }
}