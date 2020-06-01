import React from 'react'
import reactDom from 'react-dom'
import Loadable from 'react-loadable'
import { HashRouter, Route, BrowserHistory, Redirect, Switch } from 'react-router-dom'
import { AppContainer } from 'react-hot-loader'
import { Provider } from 'react-intl-redux'
import './app.css'
import LoadingPage from './components/LoadingPage/LoadingPage'
import SystemMenu from './components/SystemMenu/SystemMenu'

import { ConfigProvider } from 'antd'
import zhCN from 'antd/es/locale/zh_CN'

const Loading = () => <LoadingPage />
const Evaluate = Loadable({
  loader: () => import('./containers/InterPlan/Evaluate/Evaluate'),
  loading: Loading,
  delay: 0,
})
const NodeEvaluate = Loadable({
  loader: () => import('./containers/AreaPlan/AreaEvaluate/NodeEvaluate'),
  loading: Loading,
  delay: 0,
})
const AreaFlow = Loadable({
  loader: () => import('./containers/AreaPlan/AreaFlow/AreaFlow'),
  loading: Loading,
  delay: 0,
})
const AreaAllocation = Loadable({
  loader: () => import('./containers/AreaPlan/AreaAllocation/AreaAllocation'),
  loading: Loading,
  delay: 0,
})
const AreaCanalization = Loadable({
  loader: () => import('./containers/AreaPlan/AreaCanalization/AreaCanalization'),
  loading: Loading,
  delay: 0,
})
const AreaEvaluate = Loadable({
  loader: () => import('./containers/AreaPlan/AreaEvaluate/AreaEvaluate'),
  loading: Loading,
  delay: 0,
})
const AreaSingal = Loadable({
  loader: () => import('./containers/AreaPlan/AreaSingal/AreaSingal'),
  loading: Loading,
  delay: 0,
})
const TestGreenWave = Loadable({
  loader: () => import('./TestGreenWave'),
  loading: Loading,
  delay: 0,
})
const Trafficmanage = Loadable({
  loader: () => import('./containers/TrafficManage/TrafficManage/TrafficManage'),
  loading: Loading,
  delay: 0,
})
const Trafficassess = Loadable({
  loader: () => import('./containers/TrafficManage/TrafficAssess/TrafficAssess'),
  loading: Loading,
  delay: 0,
})
const Canalization = Loadable({
  loader: () => import('./containers/InterPlan/Canalization/Canalization'),
  loading: Loading,
  delay: 0,
})
const Singal = Loadable({
  loader: () => import('./containers/InterPlan/Singal/Singal'),
  loading: Loading,
  delay: 0,
})
const Trafficanalysis = Loadable({
  loader: () => import('./containers/TrafficAnalysis/TrafficAnalysis'),
  loading: Loading,
  delay: 0,
})
const Flow = Loadable({
  loader: () => import('./containers/InterPlan/Flow/Flow'),
  loading: Loading,
  delay: 0,
})
const Trafficdatas = Loadable({
  loader: () => import('./containers/TrafficDatas/TrafficDatas/TrafficDatas'),
  loading: Loading,
  delay: 0,
})
const Trafficareadatas = Loadable({
  loader: () => import('./containers/TrafficDatas/TrafficAreaDatas/TrafficAreaDatas'),
  loading: Loading,
  delay: 0,
})
const Trafficarea = Loadable({
  loader: () => import('./containers/TrafficArea/TrafficArea/TrafficArea'),
  loading: Loading,
  delay: 0,
})
const Infomanage = Loadable({
  loader: () => import('./containers/TrafficArea/InfoManage/InfoManage'),
  loading: Loading,
  delay: 0,
})
const Promanage = Loadable({
  loader: () => import('./containers/TrafficArea/ProManage/ProManage'),
  loading: Loading,
  delay: 0,
})
const Header = Loadable({
  loader: () => import('./containers/Header/Header'),
  loading: Loading,
  delay: 0,
})
const Entrance = Loadable({
  loader: () => import('./containers/Entrance/Entrance'),
  loading: Loading,
  delay: 0,
})
// const Entrances = Loadable({
//   loader: () => import('./containers/Entrance/StaticEntrance'),
//   loading: Loading,
//   delay: 0,
// })
const Entrances = Loadable({
  loader: () => import('./containers/EntrancePlus/EntrancePlus'),
  loading: Loading,
  delay: 0,
})
const Roadtraffic = Loadable({
  loader: () => import('./containers/InterPlan/Roadtraffic/Roadtraffic'),
  loading: Loading,
  delay: 0,
})
const Informationmana = Loadable({
  loader: () => import('./containers/InterPlan/Informationmana/Informationmana'),
  loading: Loading,
  delay: 0,
})
const Projectmana = Loadable({
  loader: () => import('./containers/InterPlan/Projectmana/Projectmana'),
  loading: Loading,
  delay: 0,
})
const Allocation = Loadable({
  loader: () => import('./containers/InterPlan/Allocation/Allocation'),
  loading: Loading,
  delay: 0,
})
const Facilitiesmana = Loadable({
  loader: () => import('./containers/InterPlan/Facilitiesmana/Facilitiesmana'),
  loading: Loading,
  delay: 0,
})
const Login = Loadable({
  loader: () => import('./containers/Login/Login'),
  loading: Loading,
  delay: 0,
})

const Parent = () => (
  <div>
    {/* <Route path="*" component={SystemMenu} /> */}
    <Route exact path="/informationmana" component={Informationmana} />
    <Route exact path="/facilitiesmana" component={Facilitiesmana} />
    <Route exact path="/roadtraffic" component={Roadtraffic} />
    <Route exact path="/projectmana" component={Projectmana} />
    {/* <Route exact path="/entrance" component={Entrance} /> */}
    {/* <Route exact path="/entrances" component={Entrances} /> */}
    <Route exact path="/header" component={Header} />
    <Route exact path="/flow" component={Flow} />
    <Route exact path="/allocation" component={Allocation} />
    <Route exact path="/canalization" component={Canalization} />
    <Route exact path="/singal" component={Singal} />
    <Route exact path="/evaluate" component={Evaluate} />
    <Route exact path="/nodeEvaluate" component={NodeEvaluate} />
    <Route exact path="/trafficanalysis" component={Trafficanalysis} />
    <Route exact path="/trafficdatas" component={Trafficdatas} />
    <Route exact path="/trafficareadatas" component={Trafficareadatas} />
    <Route exact path="/trafficarea" component={Trafficarea} />
    <Route exact path="/promanage" component={Promanage} />
    <Route exact path="/infomanage" component={Infomanage} />
    <Route exact path="/trafficmanage" component={Trafficmanage} />
    <Route exact path="/trafficassess" component={Trafficassess} />
    <Route exact path="/areaSingal" component={AreaSingal} />
    <Route exact path="/areaFlow" component={AreaFlow} />
    <Route exact path="/areaAllocation" component={AreaAllocation} />
    <Route exact path="/areaCanalization" component={AreaCanalization} />
    <Route exact path="/areaEvaluate" component={AreaEvaluate} />
    <Route exact path="/testGreenWave" component={TestGreenWave} />
  </div>
)
reactDom.render(
  <AppContainer>
    <ConfigProvider locale={zhCN}>
      {/* //<Provider> */}
      <HashRouter basename="" history={BrowserHistory}>
        <Switch>
          <Redirect exact from="/" to="/login" />
          <Route exact path="/entrances" component={Entrances} />
          {/* <Route exact path="/login" component={Login} /> */}
          <Route path="/" component={Parent} />
        </Switch>
      </HashRouter>
      {/* //</Provider> */}
    </ConfigProvider>
  </AppContainer>
  , document.getElementById('content'),
)
