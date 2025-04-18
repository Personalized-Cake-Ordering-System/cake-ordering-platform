export const NotificationTypes = {
  MAKING_BILLING: "MAKING_BILLING",
  PAYMENT_SUCCESS: "PAYMENT_SUCCESS",
  NEW_ORDER: "NEW_ORDER",
  PROCESSING_ORDER: "PROCESSING_ORDER",
  SHIPPING_ORDER: "SHIPPING_ORDER",
  READY_FOR_PICKUP: "READY_FOR_PICKUP",
  COMPLETED_ORDER: "COMPLETED_ORDER",
  CANCELED_ORDER: "CANCELED_ORDER",
  NEW_BAKERY_REGISTRATION: "NEW_BAKERY_REGISTRATION",
  NEW_REPORT: "NEW_REPORT",

};

export const getNotificationMessage = (type: string): string => {
  switch (type) {
    case NotificationTypes.MAKING_BILLING:
      return "Đang tạo hóa đơn mới.";
    case NotificationTypes.PAYMENT_SUCCESS:
      return "Thanh toán thành công!";
    case NotificationTypes.NEW_ORDER:
      return "Bạn có đơn hàng mới.";
    case NotificationTypes.PROCESSING_ORDER:
      return "Đơn hàng đang được xử lý.";
    case NotificationTypes.SHIPPING_ORDER:
      return "Đơn hàng đang được vận chuyển.";
    case NotificationTypes.READY_FOR_PICKUP:
      return "Đơn hàng đã sẵn sàng để nhận.";
    case NotificationTypes.COMPLETED_ORDER:
      return "Đơn hàng đã hoàn tất quá trình.";
    case NotificationTypes.CANCELED_ORDER:
      return "Đơn hàng đã bị hủy.";
    case NotificationTypes.NEW_BAKERY_REGISTRATION:
      return "Có tiệm bánh mới đăng ký.";
    case NotificationTypes.NEW_REPORT:
      return "Có báo cáo mới được gửi.";
    default:
      return "Cửa hàng hoàn thành bánh";
  }
};
