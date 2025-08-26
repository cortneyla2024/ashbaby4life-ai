"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: any) => void;
}

const TRANSACTION_CATEGORIES = {
  Income: ["Salary", "Freelance", "Investment", "Gift", "Other"],
  Expense: ["Groceries", "Dining", "Transportation", "Entertainment", "Shopping", "Utilities", "Rent", "Healthcare", "Education", "Other"],
};

export default function TransactionForm({ isOpen, onClose, onSubmit }: TransactionFormProps) {
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "Expense",
    category: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/finance/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const transaction = await response.json();
        onSubmit(transaction);
        onClose();
        setFormData({
          description: "",
          amount: "",
          type: "Expense",
          category: "",
          date: new Date().toISOString().split("T")[0],
          notes: "",
        });
      } else {
        console.error("Failed to create transaction");
      }
    } catch (error) {
      console.error("Error creating transaction:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTypeChange = (type: string) => {
    setFormData(prev => ({ ...prev, type, category: "" }));
  };

  if (!isOpen) {
return null;
}

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Add Transaction</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant={formData.type === "Income" ? "default" : "outline"}
                onClick={() => handleTypeChange("Income")}
                className="flex-1"
              >
                <Badge variant="secondary" className="mr-2">+</Badge>
                Income
              </Button>
              <Button
                type="button"
                variant={formData.type === "Expense" ? "default" : "outline"}
                onClick={() => handleTypeChange("Expense")}
                className="flex-1"
              >
                <Badge variant="secondary" className="mr-2">-</Badge>
                Expense
              </Button>
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What was this transaction for?"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Amount</label>
              <Input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Category</label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {TRANSACTION_CATEGORIES[formData.type as keyof typeof TRANSACTION_CATEGORIES]?.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Notes (Optional)</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional details..."
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Adding..." : "Add Transaction"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
