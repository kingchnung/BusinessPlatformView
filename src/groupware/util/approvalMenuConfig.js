

export const approvalMenuConfig = [
  {
    key: "approvals",
    label: "전자결재",
    children: [
      {
        key: "all",
        label: "전체 문서",
        path: "/approvals",
      },
      {
        key: "draft",
        label: "임시저장",
        path: "/approvals?status=DRAFT",
      },
      {
        key: "waiting",
        label: "결재 대기",
        path: "/approvals?status=IN_PROGRESS",
      },
      {
        key: "approved",
        label: "승인 문서",
        path: "/approvals?status=APPROVED",
      },
      {
        key: "rejected",
        label: "반려 문서",
        path: "/approvals?status=REJECTED",
      },
    ],
  },
];