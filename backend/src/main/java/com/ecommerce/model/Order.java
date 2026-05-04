package com.ecommerce.model;

public class Order {
    private int    orderId;
    private double totalAmount;
    private String orderStatus;
    private String orderDate;
    private String paymentMethod;
    private String deliveryAddress;

    public int    getOrderId()              { return orderId; }
    public void   setOrderId(int v)         { this.orderId = v; }

    public double getTotalAmount()           { return totalAmount; }
    public void   setTotalAmount(double v)   { this.totalAmount = v; }

    public String getOrderStatus()           { return orderStatus; }
    public void   setOrderStatus(String v)   { this.orderStatus = v; }

    public String getOrderDate()             { return orderDate; }
    public void   setOrderDate(String v)     { this.orderDate = v; }

    public String getPaymentMethod()         { return paymentMethod; }
    public void   setPaymentMethod(String v) { this.paymentMethod = v; }

    public String getDeliveryAddress()         { return deliveryAddress; }
    public void   setDeliveryAddress(String v) { this.deliveryAddress = v; }
}