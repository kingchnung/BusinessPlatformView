import React, { useEffect, useState } from "react";
import { Form, Input, Button, message, Spin, Card, Row, Col } from "antd";
import axiosInstance from "../../../common/axiosInstance";
import { updateMyInfo } from "../../../api/hr/employeeApi";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const EmployeeMyEditPage = () => {
  const [form] = Form.useForm();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const navigate = useNavigate();

  // ✅ 직원 정보 불러오기
  useEffect(() => {
    const fetchMyInfo = async () => {
      try {
        const res = await axiosInstance.get(`/employees/me`);
        const emp = res.data;
        setEmployee(emp);
        form.setFieldsValue({
          empName: emp.empName,
          deptName: emp.deptName,
          positionName: emp.positionName,
          gradeName: emp.gradeName,
          gender: emp.gender === "M" ? "남성" : "여성",
          birthDate: dayjs(emp.birthDate).format("YYYY-MM-DD"),
          startDate: dayjs(emp.startDate).format("YYYY-MM-DD"),
          phone: emp.phone,
          email: emp.email,
          address: emp.address,
        });
      } catch (err) {
        console.error("인사카드 불러오기 오류:", err);
        message.error("내 인사카드를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchMyInfo();
  }, [form]);

  // ✅ 근속연수 계산
  const calcCareer = (startDate) => {
    if (!startDate) return "-";
    const years = dayjs().diff(dayjs(startDate), "year");
    return `${years}년차`;
  };

  // ✅ 수정 요청
  const onFinish = async (values) => {
    try {
      await updateMyInfo(values);
      message.success("내 인사카드가 수정되었습니다.");
      navigate("/hr/employee/cards");
    } catch (err) {
      console.error(err);
      message.error("수정 중 오류가 발생했습니다.");
    }
  };

  // ✅ 재직증명서 발급
  const handleDownloadCertificate = async () => {
    setDownloading(true);
    try {
      const response = await axiosInstance.get("/certificates/mycertificates", {
        responseType: "blob",
      });

      let filename = "재직증명서.pdf";
      const disposition = response.headers["content-disposition"];
      if (disposition) {
        const filenameStarMatch = /filename\*=UTF-8''([^;]+)/.exec(disposition);
        if (filenameStarMatch && filenameStarMatch[1]) {
          filename = decodeURIComponent(filenameStarMatch[1]);
        } else {
          const filenameMatch = /filename="([^"]+)"/.exec(disposition);
          if (filenameMatch && filenameMatch[1]) filename = filenameMatch[1];
        }
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      message.success("재직증명서가 발급되었습니다.");
    } catch (err) {
      console.error("재직증명서 발급 오류:", err);
      message.error("재직증명서 발급 중 오류가 발생했습니다.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" tip="내 인사카드 정보를 불러오는 중..." />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px" }}>
      <Card title="👤 My Page" bordered={false} style={{ borderRadius: 12 }}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="이름" name="empName">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="성별" name="gender">
                <Input disabled />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="부서명" name="deptName">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="직급" name="positionName">
                <Input disabled />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="직책(등급)" name="gradeName">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="입사일" name="startDate">
                <Input disabled />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="생년월일" name="birthDate">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="근속연수">
                <Input disabled value={calcCareer(employee.startDate)} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="전화번호"
                name="phone"
                rules={[{ required: true, message: "전화번호를 입력하세요." }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="이메일"
                name="email"
                rules={[
                  { required: true, message: "이메일을 입력하세요." },
                  { type: "email", message: "유효한 이메일 형식이 아닙니다." },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="주소"
                name="address"
                rules={[{ required: true, message: "주소를 입력하세요." }]}
              >
                <Input.TextArea rows={2} />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ textAlign: "center", marginTop: 24 }}>
            <Button
              type="primary"
              htmlType="submit"
              style={{ width: 200, marginRight: 10 }}
            >
              수정하기
            </Button>
            <Button
              type="default"
              onClick={handleDownloadCertificate}
              loading={downloading}
              style={{ width: 200 }}
            >
              재직증명서 발급
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default EmployeeMyEditPage;
