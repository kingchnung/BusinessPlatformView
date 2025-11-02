

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
      {
        key: "/admin/system/roles",
        label: "역할 관리",
        path: "/admin/system/roles",
        role: "ROLE_ADMIN",
      },
      {
        key: "/admin/system/permissions",
        label: "권한 관리",
        path: "/admin/system/permissions",
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
        key: "/admin/baseinfo/grades",
        label: "직급 관리",
        path: "/admin/baseinfo/grades", // 미정
        role: "ROLE_ADMIN",
      },
      {
        key: "/admin/baseinfo/positions",
        label: "직위 관리",
        path: "/admin/baseinfo/positions", // 미정
        role: "ROLE_ADMIN",
      },
    ],
  },
  {
    key: "account",
    label: "계정 관리",
    role: "ROLE_ADMIN",
    children: [
      {
        key: "/admin/system/accounts",
        label: "계정 관리",
        path: "/admin/system/accounts",
        role: "ROLE_ADMIN",
      },
    ]
  },
  // -------------------------
  // ① 전자결재 관리
  // -------------------------
  {
    key: "approvalAdmin",
    label: "전자결재 관리",
    role: "ROLE_ADMIN",
    children: [
      {
        key: "/admin/approval/list",
        label: "전자결재 문서 관리",
        path: "/admin/approval/list",
        role: "ROLE_ADMIN",
      },
      {
        key: "/admin/approval/policy",
        label: "결재선 정책 관리",
        path: "/admin/approval/policy",
        role: "ROLE_ADMIN",
      },
    ],
  },

  // -------------------------
  // ② 게시판 관리
  // -------------------------
  // {
  //   key: "boardAdmin",
  //   label: "게시판 관리",
  //   role: "ROLE_ADMIN",
  //   children: [
  //     {
  //       key: "/admin/boards/manage",
  //       label: "게시글 관리",
  //       path: "/admin/boards/manage",
  //       role: "ROLE_ADMIN",
  //     }
  //   ],
  // },

];