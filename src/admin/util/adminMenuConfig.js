

export const adminMenuConfig = [
  {
    key: "admin",
    label: "시스템 관리",
    
    // ✅ 'ROLE_ADMIN'만 접근 가능하도록 role 속성 추가
    role: "ROLE_ADMIN", 
    children: [
      {
        key: "/admin/departments",
        label: "부서 관리",
        path: "/admin/departments",
        role: "ROLE_ADMIN",
      },
      // { key: '/admin/users', label: '사용자 관리', path: '/admin/users', role: 'ROLE_ADMIN' },
    ],
  },
  // -------------------------
  // ③ 기준정보 관리 (어드민 전용)
  // -------------------------
  {
    key: "baseInfo",
    label: "기준정보 관리",
    role: "ROLE_ADMIN",
    children: [
      {
        key: "ranks",
        label: "직급 관리",
        path: "", // 미정
      },
      {
        key: "positions",
        label: "직위 관리",
        path: "", // 미정
      },
    ],
  },

  // -------------------------
  // ④ 시스템 관리 (어드민 전용)
  // -------------------------
  {
    key: "system",
    label: "시스템 관리",
    role: "ROLE_ADMIN",
    children: [
      {
        key: "roles",
        label: "역할 관리",
        path: "", // 미정

      },
      {
        key: "permissions",
        label: "권한 관리",
        path: "", // 미정

      },
    ],
  },
];