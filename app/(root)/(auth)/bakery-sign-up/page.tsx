"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const BakerySignUpPage = () => {
    const [loading, setLoading] = useState(false);

    return (
        <div>
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl font-semibold">
                        Bakery Sign Up
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="taxCode">Tax Code</Label>
                                <Input id="taxCode" placeholder="Enter tax code" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="your@email.com" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input id="phone" placeholder="Enter phone number" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Input id="address" placeholder="Enter street address" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="province">Province</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select province" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="hanoi">Hà Nội</SelectItem>
                                        <SelectItem value="hochiminh">Hồ Chí Minh</SelectItem>
                                        {/* Add more provinces */}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="district">District</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select district" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {/* Districts will be populated based on selected province */}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bankName">Bank Name</Label>
                                <Input id="bankName" placeholder="Enter bank name" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bankAccount">Bank Account Number</Label>
                                <Input id="bankAccount" placeholder="Enter bank account number" />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? "Creating..." : "Create Bakery Account"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default BakerySignUpPage;
