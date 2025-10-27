export const boardMenuConfig = [
  {
    key: "boards",
    label: "사내게시판",
    children: [
      { 
        key: "/boards", 
        label: "전체 게시판" ,
        path: "/boards",
      },
      {
        key: "/boards/type/notice", 
        label: "공지사항",
        path : "/boards/type/notice",
      },
      { 
        key: "/boards/type/suggestion", 
        label: "건의사항",
        path :"/boards/type/suggestion" 
      },
      { 
        key: "/boards/type/general", 
        label: "일반 게시판",
        path:"/boards/type/general", 
      },
    ],
  },
];