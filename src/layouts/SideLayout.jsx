import React, { useMemo, useState, useEffect } from "react";
import { Layout, Menu } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
// 메뉴 설정 파일 import (경로 확인!)
import { hrMenuConfig } from "../hr/util/hrMenuConfig";
import { salesMenuConfig } from "../sales/util/salesMenuConfig";
import { mainMenuConfig } from "./mainMenuConfig"; // mainMenuConfig 경로 확인!
// HR 전용 경로 조정 함수 (HR 외에는 적용 X)
import { applyRoleBasedMenuPath } from "../hr/util/applyRoleBasedMenuPath";

const { Sider } = Layout;

// 1. getMenuConfig: 현재 경로에 맞는 메뉴 설정 반환
const getMenuConfig = (pathname) => {
  // console.log("[getMenuConfig] 경로 확인:", pathname); // 디버깅용
  if (pathname.startsWith("/hr")) return hrMenuConfig;
  if (pathname.startsWith("/sales")) return salesMenuConfig;
  if (pathname === "/" || pathname === "/main") return mainMenuConfig;
  return []; // 그 외 경로는 사이드바 없음
};

// 2. getOpenKeys: 현재 경로에 맞는 상위 메뉴 key 배열 반환 (하위 메뉴 열기용)
const getOpenKeys = (pathname, menuConfig) => {
  // menuConfig가 유효한 배열인지 확인
  if (!Array.isArray(menuConfig)) return [];
  for (const menu of menuConfig) {
    // children이 있고, 그 children 중 하나의 path가 현재 pathname으로 시작하면
    if (menu.children && menu.children.some(child => child.path && pathname.startsWith(child.path))) {
      // console.log("[getOpenKeys] 상위 키 찾음:", menu.key, "경로:", pathname); // 디버깅용
      return [menu.key]; // 해당 상위 메뉴의 key 반환
    }
  }
  // console.log("[getOpenKeys] 상위 키 못 찾음:", pathname); // 디버깅용
  return [];
};

// 3. getSelectedKeys: 현재 경로와 가장 일치하는 메뉴 key 배열 반환 (하이라이트용)
const getSelectedKeys = (pathname, menuConfig) => {
  if (!Array.isArray(menuConfig)) return [];
  let selected = [];
  let bestMatchLength = 0;

  const findKey = (items) => {
    items.forEach(item => {
      if (item.path) {
        // 현재 경로가 메뉴 경로로 시작하는지 확인
        if (pathname.startsWith(item.path)) {
          // 더 길거나 같은 길이로 일치하는 경로를 우선
          if (item.path.length >= bestMatchLength) {
             // 정확히 일치하거나, 더 긴 경로를 최종 선택
             if (pathname === item.path || item.path.length > bestMatchLength) {
                selected = [item.key]; // config에 정의된 고유 key 사용
                bestMatchLength = item.path.length;
             }
          }
        }
      }
      // 자식 메뉴 재귀 탐색
      if (item.children) {
        findKey(item.children);
      }
    });
  };

  findKey(menuConfig);
  // console.log("[getSelectedKeys] 선택된 키:", pathname, selected); // 디버깅용
  return selected;
};


const SideLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentOpenKeys, setCurrentOpenKeys] = useState([]);

  // 사용자 역할 안전하게 가져오기 (useMemo 사용)
  const userRoles = useMemo(() => {
    try {
      const stored = localStorage.getItem("roles");
      // console.log("[SideLayout] LocalStorage 'roles':", stored); // 디버깅 시 확인!
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // console.log("[SideLayout] Parsed 'userRoles':", parsed); // 디버깅 시 확인!
          return parsed; // 배열이면 반환
        } else {
           console.warn("[SideLayout] 파싱된 'roles'가 배열이 아님:", parsed);
        }
      } else {
           console.log("[SideLayout] localStorage에 'roles' 없음.");
      }
    } catch (err) {
      console.error("[SideLayout] 'roles' 파싱 실패:", err);
    }
    return []; // 문제 발생 시 빈 배열 반환
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  // 현재 경로에 맞는 기본 메뉴 설정
  const baseMenuConfig = useMemo(() => getMenuConfig(location.pathname), [location.pathname]);

  // HR 메뉴에만 경로 조정 적용
  const adjustedMenuConfig = useMemo(() => {
    // applyRoleBasedMenuPath 함수 존재 여부 확인 추가
    if (baseMenuConfig === hrMenuConfig && typeof applyRoleBasedMenuPath === 'function') {
      return applyRoleBasedMenuPath(baseMenuConfig, userRoles);
    }
    return baseMenuConfig;
  }, [baseMenuConfig, userRoles]);

  // 역할 기반 메뉴 필터링
  const filteredMenu = useMemo(() => {
    // adjustedMenuConfig 유효성 검사 강화
    if (!Array.isArray(adjustedMenuConfig) || adjustedMenuConfig.length === 0) {
        // console.log("[SideLayout] Filtered Menu: [] (adjusted config 없음)"); // 디버깅
        return [];
    }
    // 원본 변경 방지 위한 깊은 복사
    const copiedMenu = JSON.parse(JSON.stringify(adjustedMenuConfig));
    let resultMenu = [];

    // 메인 메뉴: 로그인 사용자에게 그대로 보여줌
    if (baseMenuConfig === mainMenuConfig) {
      resultMenu = userRoles.length > 0 ? copiedMenu : [];
      // console.log("[SideLayout] Filtered Menu (Main):", resultMenu); // 디버깅
    }
    // HR 메뉴: 역할별 필터링
    else if (location.pathname.startsWith("/hr")) {
      resultMenu = copiedMenu.map((menu) => {
          if (menu.children) {
            menu.children = menu.children.filter((item) => {
              // item.key 존재 여부 확인
              if (!item.key) return false;
              if (userRoles.includes("ROLE_CEO")) return true;
              if (userRoles.includes("ROLE_MANAGER")) return item.key !== "empCardDelete";
              if (userRoles.includes("ROLE_EMPLOYEE"))
                return item.key === "empCardView" || item.key === "empCardEdit";
              return item.key === "empCardView"; // 기본 권한?
            });
          }
          return menu;
        })
        // 필터링 후 자식이 없어도 path가 있으면 상위 메뉴 유지, 또는 자식이 남은 경우
        .filter((menu) => menu.path || (menu.children && menu.children.length > 0));
    }
    // Sales 메뉴: 로그인 사용자에게 그대로 보여줌
    else if (location.pathname.startsWith("/sales")) {
      resultMenu = userRoles.length > 0 ? copiedMenu : [];
      // console.log("[SideLayout] Filtered Menu (Sales):", resultMenu); // 디버깅
    }
    // 그 외 경로는 빈 메뉴 반환
    else {
        resultMenu = [];
    }
    return resultMenu;

  }, [adjustedMenuConfig, userRoles, location.pathname, baseMenuConfig]);

  // 경로 변경 시 openKeys 업데이트
  useEffect(() => {
    // 메인 메뉴 제외
    if(baseMenuConfig !== mainMenuConfig){
        const keys = getOpenKeys(location.pathname, filteredMenu);
        // console.log("[SideLayout] Calculated Open Keys:", keys); // 디버깅
        setCurrentOpenKeys(keys);
    } else {
        setCurrentOpenKeys([]); // 메인 메뉴는 닫힌 상태
    }
  }, [location.pathname, filteredMenu, baseMenuConfig]);

  // 메뉴 열기/닫기 상태 변경 핸들러
  const handleOpenChange = (keys) => {
    setCurrentOpenKeys(keys);
  };

  // 현재 선택된 메뉴 key 계산
  const selectedKeys = useMemo(() => getSelectedKeys(location.pathname, filteredMenu), [location.pathname, filteredMenu]);

  // antd Menu items 형식으로 변환하는 재귀 함수
  const mapMenuItems = (items) => {
      // items가 배열인지 확인
      if (!Array.isArray(items)) return [];
      return items.map(item => ({
          key: item.key, // config에 정의된 고유 key
          icon: item.icon,
          label: item.label,
          // children 재귀 호출
          children: item.children ? mapMenuItems(item.children) : undefined,
      }));
  };

  // 렌더링할 최종 메뉴 아이템
  const menuItems = useMemo(() => mapMenuItems(filteredMenu), [filteredMenu]);

  // 메뉴 클릭 핸들러 (key를 이용해 path 찾기)
  const handleMenuClick = ({ key }) => {
    let targetPath = null;
    // 재귀적으로 클릭된 key에 해당하는 path 찾기
    const findPathByKey = (items) => {
        if (!Array.isArray(items)) return false;
        for(const item of items) {
            if(item.key === key && item.path) {
                targetPath = item.path;
                return true; // 찾으면 종료
            }
            // 자식 탐색
            if(item.children && findPathByKey(item.children)) return true;
        }
        return false;
    }
    // baseMenuConfig 원본에서 path를 찾는 것이 더 안전함
    findPathByKey(baseMenuConfig);

    if (targetPath) {
      navigate(targetPath); // 찾은 path로 이동
    } else {
      console.warn("클릭된 메뉴 항목의 경로를 찾을 수 없습니다:", key);
    }
  };


  return (
    // menuItems가 있을 때만 Sider 렌더링
    menuItems.length > 0 ? (
      <Sider width={200} theme="dark">
        <Menu
          mode="inline"
          openKeys={currentOpenKeys}
          onOpenChange={handleOpenChange}
          selectedKeys={selectedKeys} // 계산된 selectedKeys
          onClick={handleMenuClick} // 수정된 핸들러
          items={menuItems} // 변환된 items
        />
      </Sider>
    ) : null // 메뉴 없으면 Sider 숨김
  );
};

export default SideLayout;