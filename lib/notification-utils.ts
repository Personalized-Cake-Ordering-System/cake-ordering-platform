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
      return "A new billing is being created.";
    case NotificationTypes.PAYMENT_SUCCESS:
      return "Payment was successful!";
    case NotificationTypes.NEW_ORDER:
      return "You have a new order.";
    case NotificationTypes.PROCESSING_ORDER:
      return "An order is being processed.";
    case NotificationTypes.SHIPPING_ORDER:
      return "An order is being shipped.";
    case NotificationTypes.READY_FOR_PICKUP:
      return "An order is ready for pickup.";
    case NotificationTypes.COMPLETED_ORDER:
      return "An order has been completed.";
    case NotificationTypes.CANCELED_ORDER:
      return "An order has been canceled.";
    case NotificationTypes.NEW_BAKERY_REGISTRATION:
      return "A new bakery has registered.";
    case NotificationTypes.NEW_REPORT:
      return "A new report has been submitted.";
    default:
      return "Unknown notification type.";
  }
};
