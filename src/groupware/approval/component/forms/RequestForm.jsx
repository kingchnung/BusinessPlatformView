
import { Form, Input, Select, Divider } from "antd";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import { useFormInitializer } from "../../../util/useFormInitializer";

const { TextArea } = Input;

const RequestForm = ({ value = {}, onChange, departmentOptions = [] }) => {
  const { user: currentUser } = useSelector((state) => state.auth);

  useFormInitializer(currentUser, value, onChange);

  /** ✅ 상위 상태 업데이트 헬퍼 */
  const update = (key, val) => {
    const newValue = { ...value, [key]: val };
    onChange?.(newValue);
  };

  return (
    <>
      {/* ===========================
          기본 정보
      ============================ */}
      <Form.Item label="작성자">
        <Input value={value.drafterName || ""} readOnly />
      </Form.Item>

      <Form.Item label="소속 부서">
        <Input value={value.drafterDept || ""} readOnly />
      </Form.Item>

      <Form.Item label="작성일">
        <Input
          value={
            value.createdDate
              ? dayjs(value.createdDate).format("YYYY-MM-DD")
              : dayjs().format("YYYY-MM-DD")
          }
          readOnly
        />
      </Form.Item>

      <Divider />

      {/* ===========================
          기안 목적
      ============================ */}
      <Form.Item
        label="기안 목적"
        required
        tooltip="이 기안을 통해 어떤 일을 추진하고자 하는지 간략히 작성하세요."
      >
        <Input
          placeholder="예: 사내 워크숍 개최 승인 요청"
          value={value.purpose || ""}
          onChange={(e) => update("purpose", e.target.value)}
        />
      </Form.Item>

      {/* ===========================
          상세 내용
      ============================ */}
      <Form.Item
        label="상세 내용"
        required
        tooltip="기안의 배경, 내용, 필요성, 추진 방안을 자세히 작성하세요."
      >
        <TextArea
          rows={5}
          placeholder={`예:
- 추진 배경: 부서 간 협력 강화를 위한 워크숍 필요
- 일정: 2025년 11월 3일 ~ 11월 4일
- 장소: 양평 라비에벨 리조트
- 참여 인원: 40명 내외
- 예상비용: 약 300만원
- 요청사항: 총무팀 경비 협조 및 일정 승인 요청`}
          value={value.details || ""}
          onChange={(e) => update("details", e.target.value)}
        />
      </Form.Item>

      {/* ===========================
          기대효과
      ============================ */}
      <Form.Item
        label="기대효과"
        tooltip="이 기안이 승인되면 얻을 효과를 기술하세요."
      >
        <TextArea
          rows={3}
          placeholder="예: 부서 간 커뮤니케이션 향상, 조직문화 강화, 업무 효율 증대 등"
          value={value.effect || ""}
          onChange={(e) => update("effect", e.target.value)}
        />
      </Form.Item>

      {/* ===========================
          관련 부서
      ============================ */}
      <Form.Item label="관련 부서 (선택)">
        <Select
          mode="multiple"
          placeholder="협의 또는 검토가 필요한 부서를 선택하세요"
          options={departmentOptions}
          value={value.relatedDepts || []}
          onChange={(val) => update("relatedDepts", val)}
          showSearch
          filterOption={(input, option) =>
            option?.label.toLowerCase().includes(input.toLowerCase())
          }
        />
      </Form.Item>
    </>
  );
};

export default RequestForm;
