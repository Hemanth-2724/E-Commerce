package com.ecommerce.controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/payment-methods")
public class PaymentMethodsServlet extends HttpServlet {

    private void setCorsHeaders(HttpServletResponse res) {
        res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
        res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        res.setHeader("Access-Control-Allow-Credentials", "true");
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        setCorsHeaders(res);
        res.setStatus(HttpServletResponse.SC_OK);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        setCorsHeaders(res);
        res.setContentType("application/json;charset=UTF-8");

        String jsonResponse = "[" +
            "{\"value\": \"COD\", \"label\": \"Cash on Delivery (COD)\"}," +
            "{\"value\": \"Card\", \"label\": \"Credit / Debit Card\"}," +
            "{\"value\": \"UPI\", \"label\": \"UPI\"}" +
        "]";
        
        res.getWriter().print(jsonResponse);
    }
}