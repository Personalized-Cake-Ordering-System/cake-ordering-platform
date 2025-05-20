"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription, 
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, AlertTriangle, Store, ShoppingCart } from 'lucide-react';

interface BakerySwitchModalProps {
  isOpen: boolean;
  currentBakeryName?: string;
  newBakeryName?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function BakerySwitchModal({
  isOpen,
  currentBakeryName = "hiện tại",
  newBakeryName = "mới",
  onConfirm,
  onCancel
}: BakerySwitchModalProps) {
  // Add state to track loading during confirm action
  const [isLoading, setIsLoading] = useState(false);
  
  // Reset loading state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setIsLoading(false);
    }
  }, [isOpen]);
  
  // Wrap the onConfirm to handle loading state
  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      // Call the provided onConfirm
      await onConfirm();
      // Note: We don't close the modal here - the caller should handle that
    } catch (error) {
      console.error('Error in modal confirmation:', error);
      // Reset loading state on error
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden rounded-xl bg-gradient-to-b from-pink-50 to-white">

        <div className="flex flex-col">
          <div className="p-6 pb-2 text-center">
            <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold">Thay đổi cửa hàng</h2>
          </div>

          <div className="p-6 pt-2">
            <p className="text-center text-gray-700 mb-4">
              Giỏ hàng của bạn đang có bánh từ tiệm bánh <span className="font-medium">{currentBakeryName}</span>. Thêm bánh từ tiệm bánh <span className="font-medium">{newBakeryName}</span> sẽ xóa các mặt hàng hiện tại trong giỏ hàng của bạn.
            </p>
            
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center">
                  <div className="bg-red-50 p-2 rounded-full mr-3">
                    <ShoppingCart className="h-5 w-5 text-red-500" />
                  </div>
                  <p className="text-red-500 font-medium">
                    Bạn chỉ có thể đặt bánh từ một tiệm bánh tại một thời điểm
                  </p>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50">
                <p className="text-sm">
                  Xóa giỏ hàng hiện tại và thêm sản phẩm từ tiệm bánh {newBakeryName}?
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1 rounded-md h-12"
              disabled={isLoading}
            >
              Giữ sản phẩm hiện tại
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              className="flex-1 rounded-md h-12"
              disabled={isLoading}
            >
              {isLoading ? 'Đang xử lý...' : 'Xóa và thay đổi'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default BakerySwitchModal; 