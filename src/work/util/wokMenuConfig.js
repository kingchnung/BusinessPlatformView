/**
 * ✅ Work(업무/프로젝트) 메뉴 구조 정의
 * - 경로(path)는 실제 라우팅 기준 (현재는 비워둠)
 * - 아이콘은 모듈별 대표 아이콘으로 지정 가능
 * - 접근권한은 주석으로 표시 (ROLE 기반)
 */

export const workMenuConfig = [
  // -------------------------
  // ① 프로젝트 관리
  // -------------------------
  {
    key: "project",
    label: "프로젝트 관리",
    children: [
      {
        key: "projectMain",
        label: "프로젝트 현황", // ✅ 기본화면 (메인)
        path: "/work", // 기본 매핑
        note: "프로젝트 현황 및 개요 페이지 (모든 사용자 접근 가능)",
      },
      {
        key: "projectView",
        label: "프로젝트 조회", // ✅ 상세조회 화면
        path: "/work/project",
        note: "프로젝트 상세정보 확인 (모든 사용자 접근 가능)",
      },
      {
        key: "projectEdit",
        label: "프로젝트 멤버관리", // ✅ 인원 배분 등 관리 기능
        path: "/work/project/edit",
        role: "ROLE_MANAGER", // 매니저 이상 접근
        note: "프로젝트 인원·예산 수정 (관리자 전용)",
      },
      {
        key: "projectCreate",
        label: "프로젝트 관리", // ✅ 수동 신규 등록
        path: "/work/project/create",
        role: "ROLE_MANAGER", // 매니저 이상 접근
        note: "전자결재 외 신규 프로젝트 생성 (관리자 전용)",
      },
    ],
  },

  // -------------------------
  // ② 업무 관리
  // -------------------------
  // {
  //   key: "task",
  //   label: "업무 관리",
  //   children: [
  //     {
  //       key: "myTask",
  //       label: "내 업무 관리", // ✅ 공용
  //       path: "",
  //       note: "담당 업무 조회 및 수정 (모든 사용자 접근 가능)",
  //     },
  //     {
  //       key: "taskAssign",
  //       label: "담당자 지정", // ✅ 관리자 전용 (임시)
  //       path: "",
  //       role: "ROLE_MANAGER", // 매니저 이상 접근
  //       note: "업무 담당자 배정 기능 (관리자 전용, 추후 검토)",
  //     },
  //   ],
  // },
];
