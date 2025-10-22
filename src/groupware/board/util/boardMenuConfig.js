
export const boardMenuConfig = [
  {
    key: "boards",
    label: "사내게시판",
    path: "/boards",
    children: [
      { key: "/boards/notice", label: "공지사항", },
      { key: "/boards/suggestion", label: "건의사항", },
      { key: "/boards/general", label: "일반 게시판", },
    ],
  },
];
