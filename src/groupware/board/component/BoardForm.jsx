import React, { useState } from "react";
import { Form, Input, Button, Select, Card, message } from "antd";
import { useNavigate } from "react-router-dom";
import { createBoard } from "../../../api/groupware/boardApi";
import { useSelector } from "react-redux";

const { TextArea } = Input;

/** ── 공용: 권한 추출 & isAdmin 훅 ─────────────────────────── */
function extractAuthorities(u) {
  if (!u) return [];
  if (Array.isArray(u?.authorities)) {
    return u.authorities
      .map(a => (typeof a === "string" ? a : a?.authority))
      .filter(Boolean);
  }
  if (typeof u?.authorities === "string") {
    return u.authorities.split(",").map(s => s.trim()).filter(Boolean);
  }
  if (Array.isArray(u?.roles)) return u.roles.map(String);
  if (typeof u?.roles === "string") return u.roles.split(",").map(s => s.trim());
  return [];
}

function useIsAdmin() {
  const currentUser = useSelector(s => s?.loginSlice?.user);
  let auths = extractAuthorities(currentUser);
  if (auths.length === 0) {
    try {
      const raw = localStorage.getItem("user");
      auths = extractAuthorities(raw ? JSON.parse(raw) : null);
    } catch {}
  }
  const norm = auths.map(a => a?.toUpperCase());
  const ADMIN_SET = new Set(["ROLE_ADMIN", "ROLE_CEO", "SYS:ADMIN", "ADMIN", "CEO"]);
  return norm.some(a => ADMIN_SET.has(a));
}
/** ───────────────────────────────────────────────────────── */

const BoardForm = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const isAdmin = useIsAdmin(); // ✅ 하나만 사용

  const boardTypeOptions = isAdmin
    ? [
        { value: "NOTICE", label: "공지사항" },
        { value: "GENERAL", label: "일반 게시판" },
        { value: "SUGGESTION", label: "익명 건의사항" },
      ]
    : [
        { value: "GENERAL", label: "일반 게시판" },
        { value: "SUGGESTION", label: "익명 건의사항" },
      ];

  const onFinish = async (values) => {
    try {
      setLoading(true);

      // ✅ 프론트 1차 방어: 비관리자 NOTICE 차단(명확한 에러 메시지)
      if (!isAdmin && values.boardType === "NOTICE") {
        message.error("공지사항은 관리자만 작성할 수 있습니다.");
        return;
      }

      console.log("📤 게시글 전송 데이터:", values);
      await createBoard(values);
      message.success("게시글이 등록되었습니다.");
      navigate("/boards");
    } catch (e) {
      console.error("게시글 등록 실패:", e);
      message.error(e?.response?.data?.message || "게시글 등록 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="게시글 작성" style={{ margin: 24 }}>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="boardType"
          label="게시판 구분"
          initialValue="GENERAL" // ✅ 기본값
          rules={[{ required: true, message: "게시판 구분을 선택하세요." }]}
        >
          <Select placeholder="게시판을 선택하세요">
            {boardTypeOptions.map(opt => (
              <Select.Option key={opt.value} value={opt.value}>
                {opt.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="title"
          label="제목"
          rules={[{ required: true, message: "제목을 입력하세요." }]}
        >
          <Input placeholder="제목을 입력하세요" />
        </Form.Item>

        <Form.Item
          name="content"
          label="내용"
          rules={[{ required: true, message: "내용을 입력하세요." }]}
        >
          <TextArea rows={6} placeholder="내용을 입력하세요" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            등록
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={() => navigate("/boards")}>
            취소
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default BoardForm;