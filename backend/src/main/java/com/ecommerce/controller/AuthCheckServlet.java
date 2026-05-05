package com.ecommerce.controller;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import jakarta.servlet.annotation.WebServlet;

import java.io.IOException;
import com.ecommerce.model.User;

@WebServlet("/auth/check")
public class AuthCheckServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        res.setContentType("application/json;charset=UTF-8");

        HttpSession session = req.getSession(false);
        if (session != null && session.getAttribute("user") != null) {
            User user = (User) session.getAttribute("user");
            res.getWriter().print(
                "{\"authenticated\":true,\"userId\":" + user.getUserId() +
                ",\"fullName\":\"" + user.getFullName() +
                "\",\"email\":\"" + user.getEmail() + "\"}"
            );
        } else {
            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            res.getWriter().print("{\"authenticated\":false}");
        }
    }
}