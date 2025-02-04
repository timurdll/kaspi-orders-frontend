// GlobalCopyNotification.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";
import ReactDOM from "react-dom";

interface NotificationContextValue {
  showNotification: (message: string) => void;
}

const CopyNotificationContext = createContext<
  NotificationContextValue | undefined
>(undefined);

export const CopyNotificationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 2000);
  };

  return (
    <CopyNotificationContext.Provider value={{ showNotification }}>
      {children}
      {ReactDOM.createPortal(
        notification && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
            {notification}
          </div>
        ),
        document.body
      )}
    </CopyNotificationContext.Provider>
  );
};

export const useCopyNotification = () => {
  const context = useContext(CopyNotificationContext);
  if (!context) {
    throw new Error(
      "useCopyNotification must be used within a CopyNotificationProvider"
    );
  }
  return context.showNotification;
};
