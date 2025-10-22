

export const approvalMenuConfig = [
  {
    key: "approvals",
    label: "전자결재",
    path: "/approvals",
    children: [
      { key: "/approvals?status=DRAFT", label: "임시저장", },
      { key: "/approvals?status=IN_PROGRESS", label: "결재 대기", },
      { key: "/approvals?status=REJECTED", label: "반려 문서",  },
      { key: "/approvals?status=APPROVED", label: "승인 문서",  },
    ],
  },
];
