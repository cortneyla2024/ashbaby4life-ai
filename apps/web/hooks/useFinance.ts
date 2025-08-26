'use client';

import { useState, useCallback } from 'react';

export const useFinance = () => {
  const [loading, setLoading] = useState(false);

  const addTransaction = useCallback(async (transaction: any) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Transaction added:', transaction);
    } finally {
      setLoading(false);
    }
  }, []);

  const addBudget = useCallback(async (budget: any) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Budget added:', budget);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBudget = useCallback(async (id: string, updates: any) => {
    console.log('Budget updated:', id, updates);
  }, []);

  const addInvestment = useCallback(async (investment: any) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Investment added:', investment);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    transactions: [],
    budgets: [],
    investments: [],
    loading,
    addTransaction,
    addBudget,
    updateBudget,
    addInvestment
  };
};
