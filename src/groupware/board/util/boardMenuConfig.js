export const boardMenuConfig = [
  {
    key: "boards",
    label: "사내게시판",
    path: "/boards",
    children: [
      { key: "/boards", label: "전체 게시판" },
      { key: "/boards/type/notice", label: "공지사항" },
      { key: "/boards/type/suggestion", label: "건의사항" },
      { key: "/boards/type/general", label: "일반 게시판" },
    ],
  },
];