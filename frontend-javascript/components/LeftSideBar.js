import { Layout, Menu } from 'antd';
import {
  AppstoreOutlined,
  BarChartOutlined,
  CloudOutlined,
  ShopOutlined,
  TeamOutlined,LogoutOutlined,
  UserOutlined,UserAddOutlined,
  UploadOutlined,ShareAltOutlined,
  FolderOpenOutlined
} from '@ant-design/icons';


import {useRouter} from 'next/router';


const {Sider } = Layout;
export default function LeftSideBar() {

    const router = useRouter();
  return (
    <Sider
    style={{
      overflow: 'auto',
      height: '100vh',
      position: 'fixed',
      left: 0,
    }}
  >
    <h2 className="logo">T-Drive</h2>

    <Menu theme="dark" mode="inline" >
      <Menu.Item key="1" icon={<UserAddOutlined />} onClick={()=>router.push('/register')}>
        Register
      </Menu.Item>
      <Menu.Item key="2" icon={<UserOutlined />} onClick={()=>router.push('/login')}>
        Login
      </Menu.Item>
      <Menu.Item key="3" icon={<UploadOutlined />} onClick={()=>router.push('/uploadFile')}>
        Upload Files
      </Menu.Item>
      <Menu.Item key="4" icon={<FolderOpenOutlined />} onClick={()=>router.push('/myFiles')}>
        My Files
      </Menu.Item>
      <Menu.Item key="5" icon={<ShareAltOutlined />} onClick={()=>router.push('/shareWithMe')}>
        Shared With Me
      </Menu.Item>
      <Menu.Item key="6" icon={<LogoutOutlined />} onClick={()=>router.push('/logout')}>
        Logout
      </Menu.Item>
      
    </Menu>
  </Sider>
   
  )
}
