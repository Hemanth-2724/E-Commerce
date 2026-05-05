package com.ecommerce.util;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

/**
 * Centralized CORS filter — handles all endpoints.
 * Reads allowed origin from ALLOWED_ORIGIN env var (set this on Railway/Render/Vercel).
 * Falls back to localhost:5173 for local development.
 */
@WebFilter("/*")
public class CorsFilter implements Filter {

    private String allowedOrigin;

    @Override
    public void init(FilterConfig config) {
        // Set ALLOWED_ORIGIN=https://your-app.vercel.app on your hosting platform
        String envOrigin = System.getenv("ALLOWED_ORIGIN");
        allowedOrigin = (envOrigin != null && !envOrigin.isBlank())
                ? envOrigin
                : "http://localhost:5173";
        System.out.println("CORS allowed origin: " + allowedOrigin);
    }

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest  request  = (HttpServletRequest)  req;
        HttpServletResponse response = (HttpServletResponse) res;

        response.setHeader("Access-Control-Allow-Origin",      allowedOrigin);
        response.setHeader("Access-Control-Allow-Methods",     "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers",     "Content-Type, Authorization, X-Requested-With");
        response.setHeader("Access-Control-Allow-Credentials", "true");
        response.setHeader("Access-Control-Max-Age",           "3600");

        // Pre-flight request — respond immediately
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        chain.doFilter(req, res);
    }

    @Override
    public void destroy() {}
}