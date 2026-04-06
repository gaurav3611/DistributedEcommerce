package com.ecomm.distributed.ignite.model;

import java.io.Serializable;
import java.util.Map;

public class CheckoutRequest implements Serializable {
    private Map<String, String> address;
    private String paymentMethod;
    private String paymentDetails;

    public Map<String, String> getAddress() {
        return address;
    }

    public void setAddress(Map<String, String> address) {
        this.address = address;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getPaymentDetails() {
        return paymentDetails;
    }

    public void setPaymentDetails(String paymentDetails) {
        this.paymentDetails = paymentDetails;
    }
}
