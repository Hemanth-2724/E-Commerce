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

    // GET /cart → return cart items for logged-in user
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        res.setContentType("application/json;charset=UTF-8");

        HttpSession session = req.getSession(false);
        if (session == null || session.getAttribute("user") == null) {
            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            res.getWriter().print("{\"error\":\"Not authenticated\"}");
            return;
        }

        User user = (User) session.getAttribute("user");
        CartDAO dao = new CartDAO();
        List<CartItem> items = dao.getCartItems(user.getUserId());
        res.getWriter().print(new Gson().toJson(items));
    }

    // POST /cart → add item
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        res.setContentType("application/json;charset=UTF-8");

        HttpSession session = req.getSession(false);
        if (session == null || session.getAttribute("user") == null) {
            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            res.getWriter().print("{\"error\":\"Not authenticated\"}");
            return;
        }

        try {
            String productIdParam = req.getParameter("productId");
            String quantityParam  = req.getParameter("quantity");
            String priceParam     = req.getParameter("price");
            String sizeLabel      = req.getParameter("sizeLabel") != null
                    ? req.getParameter("sizeLabel") : "FREE";

            if (productIdParam == null || quantityParam == null || priceParam == null) {
                res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                res.getWriter().print("{\"error\":\"Missing parameters\"}");
                return;
            }

            User user = (User) session.getAttribute("user");
            CartDAO dao = new CartDAO();
            String status = dao.addToCart(
                    user.getUserId(),
                    Integer.parseInt(productIdParam),
                    Integer.parseInt(quantityParam),
                    Double.parseDouble(priceParam),
                    sizeLabel);

            if ("SUCCESS".equals(status)) {
                res.getWriter().print("{\"success\":true}");
            } else {
                res.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                res.getWriter().print("{\"error\":\"" + status + "\"}");
            }
        } catch (Exception e) {
            res.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            res.getWriter().print("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    // DELETE /cart?itemId=X → remove specific item
    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        res.setContentType("application/json;charset=UTF-8");

        HttpSession session = req.getSession(false);
        if (session == null || session.getAttribute("user") == null) {
            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            res.getWriter().print("{\"error\":\"Not authenticated\"}");
            return;
        }

        String itemIdParam = req.getParameter("itemId");
        if (itemIdParam == null) {
            res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            res.getWriter().print("{\"error\":\"Missing itemId\"}");
            return;
        }

        User user = (User) session.getAttribute("user");
        CartDAO dao = new CartDAO();
        boolean ok = dao.removeItem(Integer.parseInt(itemIdParam), user.getUserId());
        res.getWriter().print("{\"success\":" + ok + "}");
    }
}