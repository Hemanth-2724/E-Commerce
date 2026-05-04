package com.ecommerce.controller;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import jakarta.servlet.annotation.WebServlet;

import java.io.IOException;
import java.util.List;

import com.ecommerce.dao.CartDAO;
import com.ecommerce.dao.OrderDAO;
import com.ecommerce.model.CartItem;
import com.ecommerce.model.Order;
import com.google.gson.Gson;

@WebServlet("/checkout")
public class OrderServlet extends HttpServlet {

    protected void doPost(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {

        res.setHeader("Access-Control-Allow-Origin", "*");

        int userId = 1;

        CartDAO cartDAO = new CartDAO();
        List<CartItem> items = cartDAO.getCartItems(userId);

        double total = 0;
        for (CartItem item : items) {
            total += item.getQuantity() * item.getUnitPrice();
        }

        OrderDAO dao = new OrderDAO();
        boolean status = dao.placeOrder(userId, items, total);

        if (status) {
            res.getWriter().println("Order Placed ✅");
        } else {
            res.getWriter().println("Order Failed ❌");
        }
    }

    protected void doGet(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setContentType("application/json");

        int userId = 1;
        String orderId = req.getParameter("orderId");

        OrderDAO dao = new OrderDAO();
        Gson gson = new Gson();

        if (orderId != null) {
            List<CartItem> items = dao.getOrderItems(Integer.parseInt(orderId));
            res.getWriter().print(gson.toJson(items));
        } else {
            List<Order> orders = dao.getOrdersByUser(userId);
            res.getWriter().print(gson.toJson(orders));
        }
    }
}