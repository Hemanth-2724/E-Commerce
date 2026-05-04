package com.ecommerce.controller;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import jakarta.servlet.annotation.WebServlet;

import java.io.PrintWriter;
import java.sql.Connection;

import com.ecommerce.util.DBConnection;

@WebServlet("/test")
public class TestServlet extends HttpServlet {

    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, java.io.IOException {

        response.setContentType("text/html");
        PrintWriter out = response.getWriter();

        Connection conn = DBConnection.getConnection();

        if (conn != null) {
            out.println("<h1>DB Connected ✅</h1>");
        } else {
            out.println("<h1>DB Failed ❌</h1>");
        }
    }
}