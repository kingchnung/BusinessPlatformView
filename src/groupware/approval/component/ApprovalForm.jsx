import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import {
  Form, Input, Button, Card, Space, message, DatePicker, Select, Upload,
} from "antd";
import { UploadOutlined, PlusOutlined, MinusCircleOutlined, } from "@ant-design/icons";
import { draftApproval, submitDocument, uploadFile, resubmitDocument } from "../../../api/groupware/approvalApi";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { fetchEmployees } from "../../../api/hr/employeeApi";

const { TextArea } = Input;

const ApprovalForm = ({ isResubmit = false, initialData = null }) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false); // ✅ 업로드 중 여부 추가
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]); // 서버 응답 DTO
  const [fileList, setFileList] = useState([]); // UI 표시용
  const [currentDocId, setCurrentDocId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const token = localStorage.getItem("token");
  const { docId } = useParams(); // ✅ /approvals/:docId/resubmit 에서 문서 ID 받음
  const location = useLocation();

  /* ===========================================================
     ✅ 로그인 사용자 정보 로드
     =========================================================== */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setCurrentUser(parsed);
        console.log("로그인 사용자 로드:", parsed);
      } catch (e) {
        console.error("User JSON 파싱 실패:", e);
      }
    }
  }, []);

  /* ===========================================================
     ✅ 직원 목록 로드
     =========================================================== */
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const data = await fetchEmployees();
        const options = data.map((emp) => ({
          label: `${emp.empName} (${emp.deptName})`,
          value: emp.username,
        }));
        setEmployeeOptions(options);
      } catch (err) {
        console.error("직원 목록 조회 실패:", err);
        message.error("직원 정보를 불러올 수 없습니다.");
      }
    };
    loadEmployees();
  }, []);

  useEffect(() => {
    if (isResubmit) {
      const data = initialData || location.state; // ✅ props 또는 navigate state 사용
      if (data) {
        console.log("📄 재상신 문서 로드:", data);
        form.setFieldsValue({
          title: data.title,
          docType: data.docType,
          reason: data.docContent?.reason,
          lastWorkDate: data.docContent?.lastWorkDate
            ? dayjs(data.docContent.lastWorkDate)
            : null,
          approvalLine: data.approvalLine?.map((a) => ({
            approverId: a.approverCode, // ✅ 사번으로 변환
          })),
        });
        setUploadedFiles(data.attachments || []);
      }
    }
  }, [isResubmit, initialData, location.state]);


  /* ===========================================================
     ✅ 파일 업로드 (문서ID 없어도 임시 업로드 가능)
     =========================================================== */
  const handleFileUpload = async ({ file, onSuccess, onError }) => {
    console.log("📤 업로드 시작:", file.name);
    setUploading(true);

    try {
      const uploaded = await uploadFile(file, currentDocId || null);

      setUploadedFiles((prev) => [...prev, uploaded]);

      // ✅ 반드시 호출해야 Upload 내부 상태가 바뀜
      onSuccess("ok");

      message.success(`${file.name} 업로드 성공`);
      console.log("✅ 업로드 성공:", uploaded);
    } catch (err) {
      console.error("❌ 업로드 에러:", err);
      onError(err);
      message.error(`${file.name} 업로드 실패`);
    } finally {
      // ✅ 0.3초 정도 딜레이를 두고 상태 초기화 (UI 안정화)
      setTimeout(() => setUploading(false), 300);
    }
  };

  const handleFileChange = ({ fileList }) => {
    setFileList(fileList);
    console.log("📂 fileList 변경됨:", fileList);
  }
  /* ===========================================================
     ✅ 임시저장 / 상신 처리
     =========================================================== */
  const handleAction = async (type) => {
    console.log("▶️ handleAction 시작:", type);

    if (uploading) {
      message.warning("파일 업로드 중입니다. 잠시만 기다려주세요.");
      return;
    }

    setLoading(true);
    try {
      // ✅ 1️⃣ 유효성 검증
      const values = await form.validateFields().catch((err) => {
        console.error("❌ 필드 검증 실패:", err);
        message.error("필수 항목을 모두 입력해주세요.");
        throw err;
      });

      if (!currentUser) {
        message.error("로그인 정보가 없습니다. 다시 로그인해주세요.");
        return;
      }

      // ✅ 2️⃣ 업로드된 파일 DTO 변환
      const pureAttachments = uploadedFiles.map((file) => ({
        id: file.id,
        originalName: file.originalName,
        storedName: file.storedName,
        filePath: file.filePath,
        fileSize: file.fileSize,
        contentType: file.contentType,
      }));

      // ✅ 3️⃣ 서버 전송용 데이터 구성
      const data = {
        title: values.title,
        docType: values.docType,
        status: type === "draft" ? "DRAFT" : "SUBMITTED",
        docContent: {
          reason: values.reason,
          lastWorkDate: values.lastWorkDate?.format("YYYY-MM-DD") || null,
        },
        approvalLine: (values.approvalLine || []).map((a, idx) => ({
          order: idx + 1,
          approverId: a.approverId,
          decision: "PENDING",
          comment: "",
        })),
        attachments: pureAttachments,

        empId: currentUser.empId,
        username : currentUser.username,
        userId: currentUser.userId,
        roleId: currentUser.roleId || null,
        departmentId: currentUser.departmentId || null,
        empName: currentUser.empName,
      };

      console.log("📄 문서 생성 데이터:", data);
      console.log("📤 서버 요청 시작:", type, data);

      // ✅ 4️⃣ 서버 요청
      const res =
        type === "draft"
          ? await draftApproval(data)
          : type === "resubmit"
          ? await resubmitDocument(docId, data)
          : await submitDocument(data);

      // ✅ 5️⃣ 결과 처리
      if (res?.id) {
        setCurrentDocId(res.id);
        message.success(
          type === "draft"
            ? `임시저장 완료: ${res.id}`
            : `상신 완료: ${res.id}`
        );
      } else {
        message.warning("서버 응답에 문서 ID가 없습니다.");
      }

      // ✅ 6️⃣ 폼 초기화
      form.resetFields();
      setFileList([]);
      setUploadedFiles([]);
      setCurrentDocId(null);

      // ✅ 7️⃣ 페이지 이동
      navigate("/approvals");
    } catch (err) {
      console.error("❌ handleAction 오류:", err);
      if (err.response) {
        console.error("🔍 서버 응답:", err.response);
      }
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  /* ===========================================================
     ✅ 렌더링
     =========================================================== */
  return (
    <Card
      title={
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>{isResubmit ? "🔁 반려 문서 재상신" : "전자결재 작성"}</span>
          {currentUser && (
            <span style={{ fontSize: "0.9rem", color: "#888" }}>
              ✍ {currentUser.empName} {currentUser.username} 님, 작성 중입니다.
            </span>
          )}
        </div>
      }
      variant="borderless"
      style={{ marginBottom: 24 }}
    >
      <Form form={form} layout="vertical">
        {/* 문서 유형 */}
        <Form.Item
          label="문서 유형"
          name="docType"
          rules={[{ required: true, message: "문서 유형을 선택하세요." }]}
        >
          <Select
            placeholder="문서 유형을 선택하세요"
            options={[
              { label: "품의서", value: "REQUEST" },
              { label: "퇴직서", value: "RESIGN" },
              { label: "보고서", value: "REPORT" },
              { label: "인사발령", value: "HR_MOVE" },
            ]}
          />
        </Form.Item>

        {/* 제목 */}
        <Form.Item
          label="제목"
          name="title"
          rules={[{ required: true, message: "제목을 입력해주세요." }]}
        >
          <Input placeholder="제목 입력" />
        </Form.Item>

        {/* 사유 */}
        <Form.Item
          label="사유 / 내용"
          name="reason"
          rules={[{ required: true, message: "사유를 입력해주세요." }]}
        >
          <TextArea rows={4} placeholder="문서 내용을 입력하세요." />
        </Form.Item>

        {/* 예정일 */}
        <Form.Item label="예정일 (선택)" name="lastWorkDate">
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        {/* 결재자 라인 */}
        <Form.List
          name="approvalLine"
          initialValue={[{ approverId: "" }]}
          rules={[
            {
              validator: async (_, line) => {
                if (!line || line.length < 1) {
                  return Promise.reject(
                    new Error("결재자를 최소 1명 이상 추가하세요.")
                  );
                }
              },
            },
          ]}
        >
          {(fields, { add, remove }) => (
            <>
              <label style={{ fontWeight: "bold" }}>결재자 라인</label>
              {fields.map(({ key, name, ...restField }) => (
                <Space
                  key={key}
                  style={{
                    display: "flex",
                    marginBottom: 8,
                    justifyContent: "space-between",
                  }}
                  align="baseline"
                >
                  <Form.Item
                    {...restField}
                    name={[name, "approverId"]}
                    rules={[{ required: true, message: "결재자를 선택하세요." }]}
                    style={{flex: 1, minWidth: '200px'}}
                  >
                    <Select
                      placeholder="결재자 선택"
                      options={employeeOptions}
                      showSearch
                      filterOption={(input, option) =>
                        option?.label
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    />
                  </Form.Item>
                  <Button
                    type="text"
                    danger
                    icon={<MinusCircleOutlined />}
                    onClick={() => remove(name)}
                  />
                </Space>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  결재자 추가
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        {/* 열람자 */}
        <Form.Item label="열람자" name="viewerIds">
          <Select
            mode="multiple"
            placeholder="열람자를 선택하세요"
            options={employeeOptions}
            showSearch
            filterOption={(input, option) =>
              option?.label.toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>

        {/* 첨부파일 */}
        <Form.Item label="첨부파일">
          <Upload
            name="file"
            customRequest={handleFileUpload}
            showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
            headers={{ Authorization: `Bearer ${token}` }}
            fileList={fileList}
            onChange={handleFileChange}
            multiple
            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.hwp"
          >
            <Button icon={<UploadOutlined />} disabled={uploading}>
              {uploading ? "업로드 중..." : "파일 업로드"}
            </Button>
          </Upload>
        </Form.Item>

        {/* 버튼 */}
        <Space>
          <Button
            type="default"
            htmlType="button"
            onClick={() => handleAction("draft")}
            loading={loading || uploading}
            disabled={uploading}
          >
            임시저장
          </Button>
          <Button
            type="primary"
            htmlType="button"
            onClick={() =>
              handleAction(isResubmit ? "resubmit" : "submit")
            }
            loading={loading || uploading}
            disabled={uploading}
          >
            {isResubmit ? "재상신" : "상신"}
          </Button>
        </Space>
      </Form>
    </Card>
  );
};

export default ApprovalForm;
