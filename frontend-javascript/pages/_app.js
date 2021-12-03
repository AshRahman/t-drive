import 'antd/dist/antd.css';
import '../styles/globals.css'

import { Layout, Menu } from 'antd';
import {
  AppstoreOutlined,
  BarChartOutlined,
  CloudOutlined,
  ShopOutlined,
  TeamOutlined,
  UserOutlined,
  UploadOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';

const { Header, Content, Footer} = Layout;

import LeftSideBar from '../components/LeftSideBar';

function MyApp({ Component, pageProps }) {
  return (<Layout>
   <LeftSideBar/>
    <Layout className="site-layout" style={{ marginLeft: 200 }}>
      <Header className="site-layout-background" style={{ padding: 0 }} />
      <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
        <div className="site-layout-background" style={{ padding: 24, textAlign: 'center' }}>
          {/*-----*/}
          <Component {...pageProps} />
          {/*-----*/}
       </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>Ant Design ©2018 Created by Ant UED</Footer>
    </Layout>
  </Layout>)
 
  // return
}

export default MyApp

///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////



