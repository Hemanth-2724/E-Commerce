package com.ecommerce.model;

public class CartItem {

    private int    itemId;
    private int    cartId;
    private int    productId;
    private String sizeLabel;
    private int    quantity;
    private double unitPrice;

    // Enriched from JOIN with products table
    private String productName;
    private String imageUrl;
    private double discountPercent;

    // Computed helper
    public double getSubtotal() {
        return quantity * unitPrice;
    }

    public int    getItemId()          { return itemId; }
    public void   setItemId(int v)     { this.itemId = v; }

    public int    getCartId()          { return cartId; }
    public void   setCartId(int v)     { this.cartId = v; }

    public int    getProductId()       { return productId; }
    public void   setProductId(int v)  { this.productId = v; }

    public String getSizeLabel()           { return sizeLabel; }
    public void   setSizeLabel(String v)   { this.sizeLabel = v; }

    public int    getQuantity()        { return quantity; }
    public void   setQuantity(int v)   { this.quantity = v; }

    public double getUnitPrice()       { return unitPrice; }
    public void   setUnitPrice(double v){ this.unitPrice = v; }

    public String getProductName()         { return productName; }
    public void   setProductName(String v) { this.productName = v; }

    public String getImageUrl()            { return imageUrl; }
    public void   setImageUrl(String v)    { this.imageUrl = v; }

    public double getDiscountPercent()         { return discountPercent; }
    public void   setDiscountPercent(double v) { this.discountPercent = v; }
}