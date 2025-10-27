
/**
 * ✅ HR 메뉴 구조 정의
 * - 경로(path)는 실제 라우팅 기준
 * - 아이콘은 모듈별 대표 아이콘으로 지정
 * - 접근권한은 주석으로 표시 (ROLE 기준)
 */

export const hrMenuConfig = [
  // -------------------------
  // ① 인사카드 관리
  // -------------------------
  {
    key: "employee",
    label: "인사카드 관리",
    children: [
      {
        key: "orgChart",
        label: "조직도 조회",
        path: "/hr", // 기본 매핑
        note: "기본 화면, 인사카드 메뉴의 메인",
      },
      {
        key: "empCardView",
        label: "인사카드 조회",
        path: "/hr/employee/cards",
      },
      {
        key: "empCardEdit",
        label: "인사카드 수정",
        path: "/hr/employee/cards/edit",
      },
      {
        key: "adminView",
        label : "인적사항 조회",
        path : "/hr/employee/adminview",
        role : "ROLE_MANAGER",
      },
      {
        key:"empCardSelectEdit",
        label : "인사카드수정",
        path : "employee/cards/edit/select",
        role : "ROLE_MANAGER",
      },
      {
        key: "empCardAdd",
        label: "인사카드 등록",
        path: "/hr/employee/cards/add",
        role: "ROLE_MANAGER", // 매니저 이상 접근
      },
    ],
  },

  // -------------------------
  // ② 부서 관리
  // -------------------------
  {
    key: "department",
    label: "부서 관리",
    children: [
      {
        key: "deptDashboard",
        label: "부서 대시보드",
        path: "/hr/department", // 기본 매핑
      },
      {
        key: "deptOverview",
        label: "부서 현황조회",
        path: "/hr/department/overview",
      },
      {
        key: "deptAssignment",
        label: "부서 이동관리",
        path: "/hr/department/assign", 
        role: "ROLE_MANAGER", // 매니저 이상 접근
      },
      {
        key: "deptPromotion",
        label: "승진 관리",
        path: "/hr/department/promotion", 
        role: "ROLE_MANAGER", // 매니저 이상 접근
      },
   
    ],
  },
//   {
//   key: "attendance",
//   label: "근태관리",
//   path: "/hr/attendance", // 실제 페이지는 아직 없음
//   note: "2차 개발 준비중",
// },
// {
//   key: "leave",
//   label: "휴가관리",
//   path: "/hr/leave",
//   note: "2차 개발 준비중",
// },
// {
//   key: "payroll",
//   label: "급여관리",
//   path: "/hr/payroll",
//   note: "2차 개발 준비중",
// },
  {
    key: "account",
    label : "계정 관리",
    children : [
      {
        key:"account",
        label:"비밀번호 변경",
        path: "/hr/account/pwedit"
      },
    ]
  },

  
];
