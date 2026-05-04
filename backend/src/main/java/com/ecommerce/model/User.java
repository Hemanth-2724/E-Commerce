package com.ecommerce.model;

import java.io.Serializable;

public class User implements Serializable {

    private int    userId;
    private String fullName;
    private String email;
    private String phone;
    private String password;
    private String gender;
    private String address;

    public int    getUserId()          { return userId; }
    public void   setUserId(int v)     { this.userId = v; }

    public String getFullName()          { return fullName; }
    public void   setFullName(String v)  { this.fullName = v; }

    public String getEmail()             { return email; }
    public void   setEmail(String v)     { this.email = v; }

    public String getPhone()             { return phone; }
    public void   setPhone(String v)     { this.phone = v; }

    public String getPassword()          { return password; }
    public void   setPassword(String v)  { this.password = v; }

    public String getGender()            { return gender; }
    public void   setGender(String v)    { this.gender = v; }

    public String getAddress()           { return address; }
    public void   setAddress(String v)   { this.address = v; }
}