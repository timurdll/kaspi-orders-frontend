import { useState, useEffect } from "react";
import { KaspiOrder, OrderCustomStatus } from "../../types/orders";
import {
  useCompleteOrderMutation,
  useSendSecurityCodeMutation,
  useUpdateCustomStatusMutation,
  useLazyGenerateSelfDeliveryWaybillQuery,
  useUpdateOrderStatusMutation,
  useUpdateOrderStatusWithWaybillMutation,
} from "../../redux/api/api"; // Импорт из нового централизованного файла экспорта

const getInitialStatus = (order: KaspiOrder): OrderCustomStatus => {
  return (order.attributes.customStatus as OrderCustomStatus) || "NEW";
};

export const useOrderOperations = (order: KaspiOrder, storeName: string) => {
  const kaspiOrderId = order.id;
  const { attributes } = order;
  const [cardStatus, setCardStatus] = useState<OrderCustomStatus>(
    getInitialStatus(order)
  );

  const [isFetchingWaybill, setIsFetchingWaybill] = useState<boolean>(false);
  const [updateOrderStatusWithWaybill] =
    useUpdateOrderStatusWithWaybillMutation(); // Новый хук

  const [invoiceLink, setInvoiceLink] = useState<string | null>(
    attributes.kaspiDelivery?.waybill || null
  );
  const [updateOrderStatus] = useUpdateOrderStatusMutation();
  const [securityCode, setSecurityCode] = useState<string>("");
  const [showCodeInput, setShowCodeInput] = useState<boolean>(
    () => localStorage.getItem(`codeSent_${kaspiOrderId}`) === "true"
  );
  const [error, setError] = useState<string | null>(null);

  const [updateCustomStatus, { isLoading: isUpdating }] =
    useUpdateCustomStatusMutation();
  const [sendSecurityCode] = useSendSecurityCodeMutation();
  const [completeOrder] = useCompleteOrderMutation();
  const [triggerGenerateSelfDeliveryWaybill, { isFetching: isGenerating }] =
    useLazyGenerateSelfDeliveryWaybillQuery();

  useEffect(() => {
    setInvoiceLink(attributes.kaspiDelivery?.waybill || null);
    setError(null);
  }, [attributes.kaspiDelivery]);

  useEffect(() => {
    if (localStorage.getItem(`codeSent_${kaspiOrderId}`) === "true") {
      setShowCodeInput(true);
    }
  }, [kaspiOrderId]);

  const handleMarkAssembled = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateCustomStatus({
        orderId: kaspiOrderId,
        status: "ON_SHIPMENT",
      }).unwrap();
      setCardStatus("ON_SHIPMENT");
    } catch (error) {
      console.error("Ошибка при обновлении статуса заказа:", error);
    }
  };

  const handleUpdateStatus = async (newStatus: OrderCustomStatus) => {
    try {
      await updateCustomStatus({
        orderId: kaspiOrderId,
        status: newStatus,
      }).unwrap();
      setCardStatus(newStatus);
    } catch (error) {
      console.error("Ошибка обновления статуса заказа:", error);
    }
  };

  const handleSendCode = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
    try {
      await sendSecurityCode({
        orderId: kaspiOrderId,
        storeName,
        orderCode: attributes.code,
      }).unwrap();
    } catch (error) {
      console.error("Ошибка при отправке кода:", error);
      setError("Ошибка при отправке кода. Попробуйте ввести полученный код.");
    } finally {
      setShowCodeInput(true);
      localStorage.setItem(`codeSent_${kaspiOrderId}`, "true");
    }
  };

  const handleCompleteOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!securityCode) {
      setError("Пожалуйста, введите код");
      return;
    }
    try {
      await completeOrder({
        orderId: kaspiOrderId,
        storeName,
        orderCode: attributes.code,
        securityCode,
      }).unwrap();
      setShowCodeInput(false);
      setSecurityCode("");
      setCardStatus("DELIVERED");
    } catch (error) {
      console.error("Ошибка при завершении заказа:", error);
      setError("Ошибка при завершении заказа");
    }
  };

  const handleSendForTransfer = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setError(null);
    try {
      await updateOrderStatus({ orderId: kaspiOrderId, storeName }).unwrap();
    } catch (error) {
      console.error("Error sending for transfer:", error);
      setError("Ошибка при обновлении статуса заказа");
    }
  };

  const handleGenerateSelfDeliveryWaybill = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setError(null);
    try {
      const blob =
        await triggerGenerateSelfDeliveryWaybill(kaspiOrderId).unwrap();
      if (!blob) throw new Error("Не удалось получить накладную");
      const blobUrl = window.URL.createObjectURL(blob);
      setInvoiceLink(blobUrl);
      window.open(blobUrl, "_blank");
    } catch (error) {
      console.error("Ошибка формирования накладной:", error);
      setError("Ошибка формирования накладной");
    }
  };

  // const handleTransitionToOnPackaging = async (e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   setError(null);
  //   setIsFetchingWaybill(true);
  //   try {
  //     const maxAttempts = 10;
  //     let attempts = 0;
  //     let response;

  //     // Пытаемся получить накладную
  //     while (attempts < maxAttempts) {
  //       response = await updateOrderStatus({
  //         orderId: kaspiOrderId,
  //         storeName,
  //       }).unwrap();

  //       if (response?.waybill) {
  //         setInvoiceLink(response.waybill);
  //         window.open(response.waybill, "_blank");
  //         break;
  //       }

  //       attempts++;
  //       // Ждем 3 секунды перед следующим запросом
  //       await new Promise((resolve) => setTimeout(resolve, 3000));
  //     }

  //     // Проверяем, получили ли мы накладную после всех попыток
  //     if (!response?.waybill) {
  //       throw new Error(
  //         "Не удалось получить накладную после нескольких попыток"
  //       );
  //     }

  //     // После успешной генерации накладной обновляем статус на сервере
  //     const statusResponse = await updateCustomStatus({
  //       orderId: kaspiOrderId,
  //       status: "ON_PACKAGING",
  //     }).unwrap();

  //     // Проверяем ответ на успешность обновления статуса
  //     if (statusResponse && statusResponse.success) {
  //       // Только после успешного обновления на сервере меняем локальный статус
  //       setCardStatus("ON_PACKAGING");
  //     } else {
  //       throw new Error("Не удалось обновить статус заказа на ON_PACKAGING");
  //     }
  //   } catch (error) {
  //     console.error("Ошибка при переходе на ON_PACKAGING:", error);
  //     // Теперь показываем ошибку пользователю
  //     setError(
  //       "Не удалось изменить статус заказа. Пожалуйста, попробуйте еще раз."
  //     );
  //   } finally {
  //     setIsFetchingWaybill(false);
  //   }
  // };

  const handleGetKaspiWaybill = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setError(null);
    setIsFetchingWaybill(true);
    try {
      const maxAttempts = 10;
      let attempts = 0;
      let response;

      // Пытаемся получить накладную
      while (attempts < maxAttempts) {
        response = await updateOrderStatusWithWaybill({
          orderId: kaspiOrderId,
          storeName,
          orderCode: attributes.code,
        }).unwrap();

        if (response?.waybill) {
          setInvoiceLink(response.waybill);
          // window.open(response.waybill, "_blank");
          break;
        }

        attempts++;
        // Ждем 3 секунды перед следующим запросом
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }

      // const response = await updateOrderStatusWithWaybill({
      //   orderId: kaspiOrderId,
      //   storeName,
      //   orderCode: attributes.code,
      // }).unwrap();
      // if (response?.waybill) {
      // setInvoiceLink(response.waybill);
      // window.open(response.waybill, "_blank");
      // } else {
      //   setError("Накладная еще не сформирована, попробуйте позже.");
      // }
      const statusResponse = await updateCustomStatus({
        orderId: kaspiOrderId,
        status: "ON_PACKAGING",
      }).unwrap();
      if (statusResponse && statusResponse.customStatus === "ON_PACKAGING") {
        // Только после успешного обновления на сервере меняем локальный статус
        setCardStatus("ON_PACKAGING");
      } else {
        throw new Error("Не удалось обновить статус заказа на ON_PACKAGING");
      }
    } catch (error) {
      console.error("Ошибка при получении накладной:", error);
      setError("Ошибка при получении накладной");
    } finally {
      setIsFetchingWaybill(false);
    }
  };

  return {
    cardStatus,
    invoiceLink,
    securityCode,
    showCodeInput,
    error,
    isUpdating,
    isGenerating,
    isFetchingWaybill,
    setSecurityCode,
    handleMarkAssembled,
    handleUpdateStatus,
    handleSendCode,
    handleCompleteOrder,
    handleSendForTransfer,
    handleGenerateSelfDeliveryWaybill,
    handleGetKaspiWaybill,
  };
};
