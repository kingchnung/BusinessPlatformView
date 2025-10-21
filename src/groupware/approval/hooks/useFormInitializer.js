// ✅ hooks/useFormInitializer.js
import { useEffect } from "react";
import dayjs from "dayjs";

/**
 * ✅ 전자결재 문서 폼 공통 초기화 훅
 * - 최초 렌더 시 1회만 drafterName / drafterDept / createdDate 자동 세팅
 * - _initialized 플래그로 무한 렌더링 방지
 */
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);
};
