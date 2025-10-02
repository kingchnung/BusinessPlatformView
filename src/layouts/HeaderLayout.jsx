// import React from 'react';
import { Menu, Layout } from 'antd';

const { Header } = Layout;

const items1 = ['Main', 'Employee', 'Sales', 'Project', 'Groupware'].map(key => ({
  key,
  label: `${key}`,
}));

const HeaderLayout = () => {
  return (
    <Header style={{ display: 'flex', alignItems: 'center' }}>
      <div className="demo-logo" >로고</div>
      <Menu
        theme="dark"
        mode="horizontal"
        defaultSelectedKeys={['2']}
        items={items1}
        style={{ flex: 1, minWidth: 0 }}
      />
    </Header>
  );
};

export default HeaderLayout;