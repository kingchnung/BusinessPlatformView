import {
  TeamOutlined,
  UserOutlined,
  FileAddOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

// ✅ HR 메뉴 기본 정의 (공통 모듈)
export const hrMenuConfig = 
[
  {
    key: "org",
    //icon: <TeamOutlined />,
    label: "조직도 조회",
    path: "/hr",
  },
  {
    key: "empCard",
    //icon:<UserOutlined />,
    label: "인사카드 관리",
    children: [
      {
        key: "empCardView",
        label: "인사카드 조회",
        path: "/hr/employee/cards",
      },
      {
        key: "empCardEdit",
        label: "인사카드 수정",
        path: "/hr/employee/cards/edit",
        //icon: <FileAddOutlined />,
      },
      {
        key: "empCardAdd",
        label: "인사카드 등록",
        path: "/hr/employee/cards/add",
        //icon: <FileAddOutlined />,
      },
      {
        key: "empCardDelete",
        label: "인사카드 삭제",
        path: "/hr/employee/cards/delete",
        //icon: <DeleteOutlined />,
      },
    ],
  },
];
