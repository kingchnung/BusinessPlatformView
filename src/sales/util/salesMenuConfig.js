export const salesMenuConfig = [
  {
    key: "client",
    label: "거래처",
    path: "/sales/client/list",
  },
  {
    key: "activities",
    label: "영업관리",
    children: [
      {
        key: "/sales/order/list", // key를 path와 통일하는 것이 좋음
        label: "주문",
        path: "/sales/order/list",
      },
      {
        key: "/sales/sales/list",
        label: "판매",
        path: "/sales/sales/list",
      },
      {
        key: "/sales/collection/list",
        label: "수금",
        path: "/sales/collection/list",
      },
    ],
  },
  {
    key: "revenue",
    label: "매출관리",
    children: [
      {
        key: "/sales/revenue/goals",
        label: "매출 목표",
        path: "/sales/revenue/goals", // 라우터에 정의된 경로
      },
      {
        key: "/sales/sales/report",
        label: "매출 현황",
        path: "/sales/sales/report",
      },
    ],
  },
];