import { useEffect } from "react";
import dayjs from "dayjs";


export const useFormInitializer = (currentUser, value, onChange) => {
  useEffect(() => {
    if (!currentUser) return;
    if (value._initialized) return; // 이미 초기화된 경우

    const initialized = {
      ...value,
      drafterName: currentUser.empName || "",
      drafterDept: currentUser.deptName || "",
      createdDate: dayjs().format("YYYY-MM-DD"),
      _initialized: true,
    };

    onChange?.(initialized);
  }, [currentUser]);
};
