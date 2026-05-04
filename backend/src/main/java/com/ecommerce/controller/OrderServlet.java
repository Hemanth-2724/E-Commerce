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
import com.ecommerce.model.User;
import com.google.gson.Gson;

@WebServlet("/checkout")
public class OrderServlet extends HttpServlet {

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

    // POST /checkout  → place order from cart
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        setCorsHeaders(res);
        res.setContentType("application/json;charset=UTF-8");

        HttpSession session = req.getSession(false);
        if (session == null || session.getAttribute("user") == null) {
            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            res.getWriter().print("{\"error\":\"Not authenticated\"}");
            return;
        }

        User user = (User) session.getAttribute("user");
        String deliveryAddress = req.getParameter("deliveryAddress");
        String paymentMethod   = req.getParameter("paymentMethod") != null ? req.getParameter("paymentMethod") : "COD";

        CartDAO cartDAO = new CartDAO();
        List<CartItem> items = cartDAO.getCartItems(user.getUserId());

        if (items.isEmpty()) {
            res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            res.getWriter().print("{\"error\":\"Cart is empty\"}");
            return;
        }

        double total = 0;
        for (CartItem item : items) total += item.getSubtotal();

        OrderDAO dao = new OrderDAO();
        boolean ok = dao.placeOrder(user.getUserId(), items, total, paymentMethod,
                deliveryAddress != null ? deliveryAddress : user.getAddress());

        if (ok) {
            cartDAO.clearCart(user.getUserId());
            res.getWriter().print("{\"success\":true,\"message\":\"Order placed successfully!\"}");
        } else {
            res.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            res.getWriter().print("{\"error\":\"Failed to place order\"}");
        }
    }

    // GET /checkout              → list orders for user
    // GET /checkout?orderId=X    → items of a specific order
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        setCorsHeaders(res);
        res.setContentType("application/json;charset=UTF-8");

        HttpSession session = req.getSession(false);
        if (session == null || session.getAttribute("user") == null) {
            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            res.getWriter().print("{\"error\":\"Not authenticated\"}");
            return;
        }

        User user = (User) session.getAttribute("user");
        String orderId = req.getParameter("orderId");
        OrderDAO dao = new OrderDAO();
        Gson gson = new Gson();

        if (orderId != null) {
            List<CartItem> items = dao.getOrderItems(Integer.parseInt(orderId), user.getUserId());
            res.getWriter().print(gson.toJson(items));
        } else {
            List<Order> orders = dao.getOrdersByUser(user.getUserId());
            res.getWriter().print(gson.toJson(orders));
        }
    }
}