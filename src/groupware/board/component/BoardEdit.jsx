import React, { useEffect } from "react";
import { Form, Input, Button, Card, message, Select } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { getBoardDetail, updateBoard } from "../../../api/groupware/boardApi";

const { TextArea } = Input;

const BoardEdit = () => {
  const [form] = Form.useForm();
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const detail = await getBoardDetail(id);
      form.setFieldsValue(detail);
    })();
  }, [id]);

  const onFinish = async (values) => {
    await updateBoard(id, values);
    message.success("게시글이 수정되었습니다.");
    navigate(`/boards/${id}`);
  };

  return (
    <Card title="게시글 수정" style={{ margin: 24 }}>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="boardType" label="게시판 구분">
          <Select disabled>
            <Select.Option value="NOTICE">공지사항</Select.Option>
            <Select.Option value="NORMAL">일반 게시판</Select.Option>
            <Select.Option value="SUGGESTION">익명 건의사항</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="title" label="제목" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="content" label="내용" rules={[{ required: true }]}>
          <TextArea rows={6} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            수정
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={() => navigate(`/boards/${id}`)}>
            취소
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default BoardEdit;
