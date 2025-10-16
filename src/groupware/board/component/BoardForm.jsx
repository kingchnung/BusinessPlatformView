import React, { useState } from "react";
import { Form, Input, Button, Select, Card, message } from "antd";
import { useNavigate } from "react-router-dom";
import { createBoard } from "../../../api/groupware/boardApi";

const { TextArea } = Input;

const BoardForm = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      await createBoard(values);
      message.success("게시글이 등록되었습니다.");
      navigate("/board");
    } catch (e) {
      message.error("게시글 등록 실패");
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
          rules={[{ required: true, message: "게시판 구분을 선택하세요." }]}
        >
          <Select>
            <Select.Option value="NOTICE">공지사항</Select.Option>
            <Select.Option value="NORMAL">일반 게시판</Select.Option>
            <Select.Option value="SUGGESTION">익명 건의사항</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="title"
          label="제목"
          rules={[{ required: true, message: "제목을 입력하세요." }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="content"
          label="내용"
          rules={[{ required: true, message: "내용을 입력하세요." }]}
        >
          <TextArea rows={6} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            등록
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={() => navigate("/board")}>
            취소
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default BoardForm;
